"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, LogOut, Copy, Check, AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { checkTokenBalance, validateNetwork, formatTokenBalance } from "@/lib/web3-utils"

interface WalletConnectionProps {
  isConnected: boolean
  walletAddress: string
  trustBalance: number
  onConnect: (address: string, balance: number) => void
  onDisconnect: () => void
}

export function WalletConnection({
  isConnected,
  walletAddress,
  trustBalance,
  onConnect,
  onDisconnect,
}: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  const connectWallet = async () => {
    setIsConnecting(true)
    setNetworkError(null)

    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") {
        throw new Error("Not in browser environment")
      }

      const ethereum = (window as any).ethereum
      if (!ethereum) {
        toast({
          title: "Wallet Not Found",
          description: "Please install MetaMask or another Web3 wallet to continue.",
          variant: "destructive",
        })
        return
      }

      // Check if MetaMask is installed specifically
      if (!ethereum.isMetaMask && !ethereum.providers?.some((p: any) => p.isMetaMask)) {
        toast({
          title: "MetaMask Required",
          description: "This app requires MetaMask. Please install MetaMask to continue.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Attempting to connect to MetaMask...")

      if (ethereum._metamask?.isUnlocked === false) {
        toast({
          title: "MetaMask Locked",
          description: "Please unlock your MetaMask wallet and try again.",
          variant: "destructive",
        })
        return
      }

      // Request account access with proper error handling
      let accounts: string[]
      try {
        accounts = await ethereum.request({
          method: "eth_requestAccounts",
        })
      } catch (error: any) {
        console.log("[v0] MetaMask connection error:", error)

        if (error.code === 4001) {
          toast({
            title: "Connection Rejected",
            description: "You rejected the connection request. Please try again and approve the connection.",
            variant: "destructive",
          })
        } else if (error.code === -32002) {
          toast({
            title: "Connection Pending",
            description: "A connection request is already pending. Please check your MetaMask extension.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Connection Failed",
            description: error.message || "Failed to connect to MetaMask. Please try again.",
            variant: "destructive",
          })
        }
        return
      }

      if (!accounts || accounts.length === 0) {
        toast({
          title: "No Account Selected",
          description: "Please select an account in MetaMask and try again.",
          variant: "destructive",
        })
        return
      }

      const address = accounts[0]
      console.log("[v0] Connected to address:", address)

      // Validate network
      const networkValidation = await validateNetwork()
      if (!networkValidation.isSupported) {
        setNetworkError(networkValidation.error || "Please switch to Base network to use this application.")
        // Still connect but show network warning
        onConnect(address, 0)
        return
      }

      // Check token balance
      console.log("[v0] Checking token balance...")
      const balanceResult = await checkTokenBalance(address)
      if (balanceResult.error) {
        console.log("[v0] Balance check error:", balanceResult.error)
        toast({
          title: "Balance Check Failed",
          description: balanceResult.error,
          variant: "destructive",
        })
        // Still connect but with 0 balance
        onConnect(address, 0)
        return
      }

      console.log("[v0] Token balance:", balanceResult.balance)
      onConnect(address, balanceResult.balance)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error: any) {
      console.error("[v0] Wallet connection failed:", error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const refreshBalance = async () => {
    if (!walletAddress) return

    setIsRefreshing(true)
    try {
      console.log("[v0] Refreshing balance for:", walletAddress)
      const balanceResult = await checkTokenBalance(walletAddress)
      if (balanceResult.error) {
        toast({
          title: "Refresh Failed",
          description: balanceResult.error,
          variant: "destructive",
        })
        return
      }

      onConnect(walletAddress, balanceResult.balance)
      toast({
        title: "Balance Updated",
        description: `Current balance: ${formatTokenBalance(balanceResult.balance)} TRUST`,
      })
    } catch (error: any) {
      console.error("[v0] Failed to refresh balance:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh token balance.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="space-y-3">
        {networkError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{networkError}</AlertDescription>
          </Alert>
        )}
        <Button onClick={connectWallet} disabled={isConnecting} className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </div>
    )
  }

  return (
    <Card className="bg-card/50 border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">{formatAddress(walletAddress)}</span>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {formatTokenBalance(trustBalance)} TRUST
            </Badge>
            <Button variant="ghost" size="sm" onClick={refreshBalance} disabled={isRefreshing} className="h-6 w-6 p-0">
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText } from "lucide-react"
import { WalletConnection } from "@/components/wallet-connection"
import { TokenGateStatus } from "@/components/token-gate-status"
import { NotesManager } from "@/components/notes-manager"
import { CreateNoteModal } from "@/components/create-note-modal"
import { TRUST_TOKEN_CONFIG } from "@/lib/web3-utils"

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [trustBalance, setTrustBalance] = useState<number>(0)
  const [isTokenGatePassed, setIsTokenGatePassed] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    setIsTokenGatePassed(trustBalance >= TRUST_TOKEN_CONFIG.minimumBalance)
  }, [trustBalance])

  const handleWalletConnect = (address: string, balance: number) => {
    setIsConnected(true)
    setWalletAddress(address)
    setTrustBalance(balance)
  }

  const handleWalletDisconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
    setTrustBalance(0)
    setIsTokenGatePassed(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">TRUST Notes</h1>
            </div>

            <WalletConnection
              isConnected={isConnected}
              walletAddress={walletAddress}
              trustBalance={trustBalance}
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          // Welcome screen when wallet not connected
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Welcome to TRUST Notes</h2>
              <p className="text-lg text-muted-foreground">
                A secure, token-gated notes application powered by Intuition $TRUST tokens. Connect your wallet to get
                started.
              </p>
            </div>

            <Card className="p-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <FileText className="w-5 h-5" />
                  Token-Gated Access
                </CardTitle>
                <CardDescription>
                  Requires {TRUST_TOKEN_CONFIG.minimumBalance.toLocaleString()} $TRUST tokens to create and manage notes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          // Main app when wallet is connected
          <div className="space-y-6">
            <TokenGateStatus trustBalance={trustBalance} isConnected={isConnected} />

            {/* Notes Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Notes</h2>
              {isTokenGatePassed && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Note
                </Button>
              )}
            </div>

            {isTokenGatePassed ? (
              <NotesManager walletAddress={walletAddress} />
            ) : (
              <Card className="p-8 text-center">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Notes Locked</h3>
                  <p className="text-muted-foreground">
                    Acquire more $TRUST tokens to unlock note creation and management.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        walletAddress={walletAddress}
      />
    </div>
  )
}

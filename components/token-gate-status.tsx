"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Coins } from "lucide-react"
import { getTokenGateStatus, formatTokenBalance, TRUST_TOKEN_CONFIG } from "@/lib/web3-utils"

interface TokenGateStatusProps {
  trustBalance: number
  isConnected: boolean
}

export function TokenGateStatus({ trustBalance, isConnected }: TokenGateStatusProps) {
  if (!isConnected) {
    return null
  }

  const gateStatus = getTokenGateStatus(trustBalance)
  const required = TRUST_TOKEN_CONFIG.minimumBalance

  const getStatusIcon = () => {
    switch (gateStatus.status) {
      case "granted":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "insufficient":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "denied":
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = () => {
    switch (gateStatus.status) {
      case "granted":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Access Granted</Badge>
      case "insufficient":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Insufficient Balance
          </Badge>
        )
      case "denied":
        return <Badge variant="destructive">Access Denied</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Token Gate Status
            </div>
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>Your current $TRUST token balance and access level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{formatTokenBalance(trustBalance)} TRUST</p>
              <p className="text-sm text-muted-foreground">Required: {formatTokenBalance(required)} TRUST</p>
            </div>
            {getStatusIcon()}
          </div>

          {gateStatus.status !== "granted" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to access</span>
                <span>{Math.round(gateStatus.progress)}%</span>
              </div>
              <Progress value={gateStatus.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {gateStatus.status !== "granted" && (
        <Alert variant={gateStatus.status === "insufficient" ? "default" : "destructive"}>
          {gateStatus.status === "insufficient" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{gateStatus.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

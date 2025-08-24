// Web3 utility functions for token gating and contract interactions
// TODO: Replace placeholder values with actual contract details

export const TRUST_TOKEN_CONFIG = {
  // TODO: Replace with actual $TRUST token contract address on Base/Intuition chain
  contractAddress: "0x1234567890123456789012345678901234567890",
  // TODO: Replace with actual ABI for $TRUST token contract
  abi: [
    // Standard ERC-20 ABI methods needed for balance checking
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      type: "function",
    },
  ],
  minimumBalance: 0.02,
  // Token decimals (typically 18 for ERC-20)
  decimals: 18,
}

export const SUPPORTED_NETWORKS = {
  // Base Mainnet
  8453: {
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
  },
  // Base Sepolia Testnet
  84532: {
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
  },
  // TODO: Add Intuition chain details when available
}

/**
 * Safely get ethereum provider without causing redefinition errors
 */
function getEthereumProvider() {
  if (typeof window === "undefined") {
    return null
  }

  // Safely access ethereum without redefinition
  return (window as any).ethereum || null
}

/**
 * Check if user has sufficient $TRUST tokens for access
 * TODO: Implement actual contract call using ethers.js or viem
 */
export async function checkTokenBalance(walletAddress: string): Promise<{
  balance: number
  hasAccess: boolean
  error?: string
}> {
  try {
    console.log("[v0] Checking token balance for:", walletAddress)

    if (!walletAddress || walletAddress.length !== 42) {
      return {
        balance: 0,
        hasAccess: false,
        error: "Invalid wallet address",
      }
    }

    // TODO: Replace with actual Web3 contract call
    const mockBalance = Math.random() * 0.1 // Random between 0-0.1 tokens
    const hasAccess = mockBalance >= TRUST_TOKEN_CONFIG.minimumBalance

    console.log("[v0] Mock balance generated:", mockBalance.toFixed(4), "Access:", hasAccess)

    return {
      balance: mockBalance,
      hasAccess,
    }
  } catch (error: any) {
    console.error("[v0] Error checking token balance:", error)
    return {
      balance: 0,
      hasAccess: false,
      error: "Failed to check token balance",
    }
  }
}

/**
 * Check if user is connected to a supported network
 */
export async function validateNetwork(): Promise<{
  isSupported: boolean
  currentNetwork?: number
  error?: string
}> {
  try {
    if (typeof window === "undefined") {
      return {
        isSupported: false,
        error: "Not in browser environment",
      }
    }

    const ethereum = getEthereumProvider()
    if (!ethereum) {
      return {
        isSupported: false,
        error: "No Web3 provider found",
      }
    }

    try {
      const chainId = await ethereum.request({ method: "eth_chainId" })
      const networkId = Number.parseInt(chainId, 16)

      console.log("[v0] Current network ID:", networkId)

      const isSupported = Object.keys(SUPPORTED_NETWORKS).includes(networkId.toString())

      if (!isSupported) {
        const supportedNetworkNames = Object.values(SUPPORTED_NETWORKS)
          .map((n) => n.name)
          .join(", ")
        return {
          isSupported: false,
          currentNetwork: networkId,
          error: `Unsupported network. Please switch to one of: ${supportedNetworkNames}`,
        }
      }

      return {
        isSupported: true,
        currentNetwork: networkId,
      }
    } catch (networkError: any) {
      console.error("[v0] Network validation error:", networkError)
      return {
        isSupported: false,
        error: "Failed to check network. Please ensure your wallet is connected.",
      }
    }
  } catch (error: any) {
    console.error("[v0] Error validating network:", error)
    return {
      isSupported: false,
      error: "Failed to validate network",
    }
  }
}

/**
 * Format token balance for display
 */
export function formatTokenBalance(balance: number): string {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(1)}M`
  }
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`
  }
  if (balance < 1) {
    return balance.toFixed(4) // Show 4 decimal places for small amounts
  }
  return balance.toLocaleString()
}

/**
 * Get token gate status with detailed information
 */
export function getTokenGateStatus(balance: number): {
  status: "granted" | "denied" | "insufficient"
  message: string
  progress: number
} {
  const required = TRUST_TOKEN_CONFIG.minimumBalance
  const progress = Math.min((balance / required) * 100, 100)

  if (balance >= required) {
    return {
      status: "granted",
      message: "Access granted! You can create and manage notes.",
      progress: 100,
    }
  }

  const needed = required - balance
  return {
    status: balance > 0 ? "insufficient" : "denied",
    message: `You need ${needed.toFixed(4)} more TRUST tokens for access.`,
    progress,
  }
}

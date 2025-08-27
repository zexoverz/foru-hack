"use client"

import type React from "react"

import { WagmiProvider, createConfig, http } from "wagmi"
import { sepolia, mainnet, polygon, arbitrum } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"

const getTransports = () => {
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID

  if (alchemyId) {
    // Use Alchemy if API key is available
    return {
      [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`),
      [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`),
      [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyId}`),
      [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyId}`),
    }
  } else {
    // Fallback to public RPC endpoints
    console.warn("[v0] Alchemy API key not found, using public RPC endpoints")
    return {
      [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
      [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
      [polygon.id]: http("https://polygon-rpc.com"),
      [arbitrum.id]: http("https://arbitrum-one-rpc.publicnode.com"),
    }
  }
}

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [sepolia, mainnet, polygon, arbitrum],
    transports: getTransports(),

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: "DID Manager",
    appDescription: "Decentralized Identity Management System",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
)

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="auto">{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Web3Provider } from "@/components/providers/wagmi-provider"

export const metadata: Metadata = {
  title: "DID Manager",
  description: "Decentralized Identity Management System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}

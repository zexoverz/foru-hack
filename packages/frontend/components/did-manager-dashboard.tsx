"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Users, Trophy, Star, Plus, Wallet, Shield, Zap, Crown, Target, Award, Loader2 } from "lucide-react"
import { 
  useDIDManager, 
  useUserProfile,
  usePublicKey,
  type ContractUserProfile 
} from "@/hooks/use-did-manager"
import { DIDHelpers } from "@/utils/did-helpers"
import { ConnectKitButton } from "connectkit"
import type { UserProfile, Community } from "@/types/did-manager"
import { sepolia } from "wagmi/chains"
import { CryptoUtils } from "@/utils/crypto-utils"

const CONTRACT_ADDRESS = "0x6A150E2681dEeb16C2e9C446572087e3da32981E" as const
const CHAIN_ID = sepolia.id

export function DIDManagerDashboard() {
  const [activeTab, setActiveTab] = useState("profile")
  const [userTokenId, setUserTokenId] = useState<bigint | undefined>(undefined)
  const [createProfileForm, setCreateProfileForm] = useState({ persona: "", publicKey: "" })
  const [mintBadgeForm, setMintBadgeForm] = useState({ badgeName: "", xpReward: "" })

  // Hooks
  const didManager = useDIDManager({
    contractAddress: CONTRACT_ADDRESS,
    chainId: CHAIN_ID,
  })

  // Read hooks - these properly follow Rules of Hooks
  const profileQuery = useUserProfile(CONTRACT_ADDRESS, userTokenId, {
    chainId: CHAIN_ID,
    enabled: !!userTokenId
  })

  const publicKeyQuery = usePublicKey(CONTRACT_ADDRESS, userTokenId, {
    chainId: CHAIN_ID,
    enabled: !!userTokenId
  })

  const isConnected = didManager.isConnected
  const walletAddress = didManager.address

  // Derived user profile from queries
  const userProfile: UserProfile | null = profileQuery.data ? {
    tokenId: userTokenId!,
    did: `0x${userTokenId!.toString(16)}`,
    publicKey: publicKeyQuery.data ? publicKeyQuery.data.toString() : "",
    persona: (profileQuery.data as ContractUserProfile).persona,
    xp: (profileQuery.data as ContractUserProfile).xp,
    level: (profileQuery.data as ContractUserProfile).level,
    badges: (profileQuery.data as ContractUserProfile).badges,
    isActive: true,
    createdAt: (profileQuery.data as ContractUserProfile).createdAt,
  } : null

  // Auto-load profile when transaction succeeds
  useEffect(() => {
    if (didManager.mintUserDID.isSuccess && userTokenId) {
      profileQuery.refetch()
      publicKeyQuery.refetch()
    }
  }, [didManager.mintUserDID.isSuccess, userTokenId])

  const handleCreateProfile = async () => {
    if (!didManager.isConnected || !createProfileForm.persona || !createProfileForm.publicKey || !walletAddress) {
      console.log("Missing required data for profile creation")
      return
    }

    try {
      const tokenId = BigInt(Date.now() + Math.floor(Math.random() * 1000))
      
      // Format publicKey properly as bytes32
      let formattedPublicKey = createProfileForm.publicKey
      if (!formattedPublicKey.startsWith('0x')) {
        formattedPublicKey = '0x' + formattedPublicKey
      }
      // Pad to 32 bytes (64 hex chars + 0x)
      if (formattedPublicKey.length < 66) {
        formattedPublicKey = formattedPublicKey.padEnd(66, '0')
      }
      
      // Set token ID immediately so hooks start watching
      setUserTokenId(tokenId)
      
      await didManager.mintUserDID.writeAsync({
        tokenId,
        to: walletAddress,
        publicKey: formattedPublicKey,
        persona: createProfileForm.persona
      })

      setCreateProfileForm({ persona: "", publicKey: "" })
    } catch (error) {
      console.error("Failed to create profile:", error)
      setUserTokenId(undefined) // Reset on error
    }
  }

  const handleMintBadge = async () => {
    if (!userTokenId || !mintBadgeForm.badgeName || !mintBadgeForm.xpReward) return

    try {
      await didManager.addBadgeToUser.writeAsync({
        userTokenId,
        badge: mintBadgeForm.badgeName
      })
      
      await didManager.addXPToUser.writeAsync({
        userTokenId,
        xpToAdd: BigInt(mintBadgeForm.xpReward)
      })
      
      // Refetch profile data
      profileQuery.refetch()
      
      setMintBadgeForm({ badgeName: "", xpReward: "" })
    } catch (error) {
      console.error("Failed to mint badge:", error)
    }
  }

  const generatePublicKey = () => {
    if (!walletAddress) return
    
    const publicKey = CryptoUtils.generatePublicKeyFromWallet(walletAddress)
    setCreateProfileForm((prev) => ({
      ...prev,
      publicKey: CryptoUtils.formatPublicKey(publicKey),
    }))
  }

  const calculateLevelProgress = (xp: bigint, level: bigint) => {
    const baseXP = Number(level) * 200
    const nextLevelXP = (Number(level) + 1) * 200
    return ((Number(xp) - baseXP) / (nextLevelXP - baseXP)) * 100
  }

  const isWriting = didManager.mintUserDID.isPending || 
                   didManager.addBadgeToUser.isPending || 
                   didManager.addXPToUser.isPending

  const isProfileLoading = profileQuery.isLoading || publicKeyQuery.isLoading

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DID Manager</h1>
                <p className="text-sm text-muted-foreground">Decentralized Identity Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ConnectKitButton />
              {isConnected && !userProfile && (
                <Button size="sm" onClick={() => setActiveTab("profile")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create DID
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="communities">
              <Users className="h-4 w-4 mr-2" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {isProfileLoading && userTokenId ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading profile...</span>
                  </div>
                </CardContent>
              </Card>
            ) : userProfile ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      User Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userProfile.persona.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{userProfile.persona}</h3>
                        <p className="text-sm text-muted-foreground font-mono">DID: {userProfile.did}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default">Active</Badge>
                          <Badge variant="outline">Level {userProfile.level.toString()}</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>XP Progress</span>
                        <span>{DIDHelpers.formatXP(userProfile.xp)}</span>
                      </div>
                      <Progress value={calculateLevelProgress(userProfile.xp, userProfile.level)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {(Number(userProfile.level) + 1) * 200 - Number(userProfile.xp)} XP to next level
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Badges & Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {userProfile.badges.length > 0 ? (
                        userProfile.badges.map((badge, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border">
                            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                              <Star className="h-4 w-4 text-accent-foreground" />
                            </div>
                            <span className="text-sm font-medium">{badge}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-muted-foreground">
                          <Award className="h-12 w-12 mx-auto mb-4 opacity-30" />
                          <p>No badges earned yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create Your DID Profile</CardTitle>
                  <CardDescription>Get started by creating your decentralized identity profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="persona">Persona</Label>
                    <Input
                      id="persona"
                      placeholder="e.g., Web3 Developer, DeFi Enthusiast"
                      value={createProfileForm.persona}
                      onChange={(e) => setCreateProfileForm((prev) => ({ ...prev, persona: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publicKey">Public Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="publicKey"
                        placeholder="0x..."
                        className="font-mono"
                        value={createProfileForm.publicKey}
                        onChange={(e) => setCreateProfileForm((prev) => ({ ...prev, publicKey: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePublicKey}
                        disabled={!walletAddress}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateProfile}
                    disabled={isWriting || !createProfileForm.persona || !createProfileForm.publicKey}
                  >
                    {didManager.mintUserDID.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create DID Profile
                  </Button>
                  {didManager.mintUserDID.error && (
                    <p className="text-sm text-destructive">
                      Error: {didManager.mintUserDID.error.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Connect Your Wallet</CardTitle>
                  <CardDescription>Connect your wallet to access DID management features</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConnectKitButton.Custom>
                    {({ isConnected, show, truncatedAddress, ensName }) => (
                      <Button className="w-full" onClick={show}>
                        <Wallet className="h-4 w-4 mr-2" />
                        {isConnected ? (ensName ?? truncatedAddress) : "Connect Wallet"}
                      </Button>
                    )}
                  </ConnectKitButton.Custom>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mint Badge</CardTitle>
                <CardDescription>Create and mint achievement badges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="badgeName">Badge Name</Label>
                  <Input
                    id="badgeName"
                    placeholder="e.g., Smart Contract Expert"
                    value={mintBadgeForm.badgeName}
                    onChange={(e) => setMintBadgeForm((prev) => ({ ...prev, badgeName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    placeholder="50"
                    value={mintBadgeForm.xpReward}
                    onChange={(e) => setMintBadgeForm((prev) => ({ ...prev, xpReward: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleMintBadge}
                  disabled={!isConnected || isWriting || !userTokenId}
                >
                  {didManager.addBadgeToUser.isPending || didManager.addXPToUser.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Award className="h-4 w-4 mr-2" />
                  )}
                  Mint Badge
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
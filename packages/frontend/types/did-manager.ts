// TypeScript interface for DID Manager smart contract
export interface DIDManagerContract {
  // View Functions - Role Constants
  ADMIN_ROLE(): Promise<string>
  DEFAULT_ADMIN_ROLE(): Promise<string>
  MINTER_ROLE(): Promise<string>

  // View Functions - Contract References
  community(): Promise<string>
  user(): Promise<string>

  // User Profile Management
  getUserProfile(userTokenId: bigint): Promise<UserProfile>
  getUserBadges(userTokenId: bigint): Promise<string[]>
  getUserMemberships(userTokenId: bigint): Promise<bigint[]>
  getPublicKey(userTokenId: bigint): Promise<string>

  // Community Management
  getCommunityRequirements(communityTokenId: bigint): Promise<CommunityRequirements>
  communityMemberCount(communityTokenId: bigint): Promise<bigint>
  communityRequirements(communityTokenId: bigint): Promise<CommunityRequirement>

  // Membership Checks
  isMember(userTokenId: bigint, communityTokenId: bigint): Promise<boolean>
  userMemberships(userTokenId: bigint, index: bigint): Promise<bigint>

  // Gas Estimation
  estimateGasForFusion(userTokenId: bigint, communityTokenId: bigint): Promise<bigint>

  // Access Control
  hasRole(role: string, account: string): Promise<boolean>
  getRoleAdmin(role: string): Promise<string>

  // Interface Support
  supportsInterface(interfaceId: string): Promise<boolean>

  // State Variables Access
  userProfiles(tokenId: bigint): Promise<UserProfileRaw>
  userPublicKeys(tokenId: bigint): Promise<string>

  // Write Functions - Minting
  mintUserDID(tokenId: bigint, to: string, publicKey: string, persona: string): Promise<void>

  mintCommunityDID(tokenId: bigint, to: string, name: string, minXp: bigint, requiredBadges: string[]): Promise<void>

  // Write Functions - User Management
  addXPToUser(userTokenId: bigint, xpToAdd: bigint): Promise<void>
  addBadgeToUser(userTokenId: bigint, badge: string): Promise<void>

  // Write Functions - Community Interaction
  fuseWithCommunity(userTokenId: bigint, communityTokenId: bigint): Promise<void>
  leaveCommunity(userTokenId: bigint, communityTokenId: bigint): Promise<void>
  updateCommunityRequirements(communityTokenId: bigint, minXp: bigint, requiredBadges: string[]): Promise<void>

  // Write Functions - Access Control
  grantRole(role: string, account: string): Promise<void>
  revokeRole(role: string, account: string): Promise<void>
  renounceRole(role: string, callerConfirmation: string): Promise<void>
  grantMinterRole(minter: string): Promise<void>
  revokeMinterRole(minter: string): Promise<void>
}

// Data Structures
export interface UserProfile {
  tokenId: bigint
  did: string
  publicKey: string
  persona: string
  xp: bigint
  level: bigint
  badges: string[]
  isActive: boolean
  createdAt: bigint
}

export interface UserProfileRaw {
  persona: string
  xp: bigint
  level: bigint
  createdAt: bigint
}

export interface CommunityRequirements {
  minXp: bigint
  requiredBadges: string[]
  isActive: boolean
}

export interface CommunityRequirement {
  minXp: bigint
  isActive: boolean
}

export interface Community {
  tokenId: bigint
  name: string
  description: string
  memberCount: bigint
  requirements: CommunityRequirements
  isJoined: boolean
}

// Events
export interface DIDManagerEvents {
  UserDIDMinted: {
    tokenId: bigint
    owner: string
    publicKey: string
  }

  CommunityDIDMinted: {
    tokenId: bigint
    owner: string
    name: string
  }

  UserProfileUpdated: {
    tokenId: bigint
    persona: string
    xp: bigint
  }

  CommunityFused: {
    userTokenId: bigint
    communityTokenId: bigint
    timestamp: bigint
  }

  CommunityLeft: {
    userTokenId: bigint
    communityTokenId: bigint
    timestamp: bigint
  }

  RoleAdminChanged: {
    role: string
    previousAdminRole: string
    newAdminRole: string
  }

  RoleGranted: {
    role: string
    account: string
    sender: string
  }

  RoleRevoked: {
    role: string
    account: string
    sender: string
  }
}

// Error Types
export interface DIDManagerErrors {
  AccessControlBadConfirmation: {}
  AccessControlUnauthorizedAccount: {
    account: string
    neededRole: string
  }
}

// Helper Types for Contract Interaction
export type ContractTransaction = {
  hash: string
  wait(): Promise<ContractReceipt>
}

export type ContractReceipt = {
  status: number
  transactionHash: string
  blockNumber: number
  gasUsed: bigint
  events?: Array<{
    event: string
    args: any[]
  }>
}

// Role Constants (as hex strings)
export const ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  ADMIN_ROLE: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
  MINTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
} as const

// ===== FIXED HOOK (use-did-manager.ts) =====
import { useMemo } from "react"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { type Address, type Hash } from "viem"

const DID_MANAGER_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccessControlBadConfirmation","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"neededRole","type":"bytes32"}],"name":"AccessControlUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"CommunityDIDMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"userTokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"communityTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CommunityFused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"userTokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"communityTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CommunityLeft","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"bytes32","name":"publicKey","type":"bytes32"}],"name":"UserDIDMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"string","name":"persona","type":"string"},{"indexed":false,"internalType":"uint256","name":"xp","type":"uint256"}],"name":"UserProfileUpdated","type":"event"},{"inputs":[],"name":"ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINTER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"},{"internalType":"string","name":"badge","type":"string"}],"name":"addBadgeToUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"},{"internalType":"uint256","name":"xpToAdd","type":"uint256"}],"name":"addXPToUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"community","outputs":[{"internalType":"contract DIDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"communityMemberCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"communityRequirements","outputs":[{"internalType":"uint256","name":"minXp","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"},{"internalType":"uint256","name":"communityTokenId","type":"uint256"}],"name":"estimateGasForFusion","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"},{"internalType":"uint256","name":"communityTokenId","type":"uint256"}],"name":"fuseWithCommunity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"communityTokenId","type":"uint256"}],"name":"getCommunityRequirements","outputs":[{"internalType":"uint256","name":"minXp","type":"uint256"},{"internalType":"string[]","name":"requiredBadges","type":"string[]"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"}],"name":"getPublicKey","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"}],"name":"getUserBadges","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"}],"name":"getUserMemberships","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"}],"name":"getUserProfile","outputs":[{"components":[{"internalType":"string","name":"persona","type":"string"},{"internalType":"uint256","name":"xp","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"string[]","name":"badges","type":"string[]"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"internalType":"struct DIDManager.UserProfile","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"grantMinterRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"isMember","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"userTokenId","type":"uint256"},{"internalType":"uint256","name":"communityTokenId","type":"uint256"}],"name":"leaveCommunity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"minXp","type":"uint256"},{"internalType":"string[]","name":"requiredBadges","type":"string[]"}],"name":"mintCommunityDID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes32","name":"publicKey","type":"bytes32"},{"internalType":"string","name":"persona","type":"string"}],"name":"mintUserDID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"callerConfirmation","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"revokeMinterRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"communityTokenId","type":"uint256"},{"internalType":"uint256","name":"minXp","type":"uint256"},{"internalType":"string[]","name":"requiredBadges","type":"string[]"}],"name":"updateCommunityRequirements","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"user","outputs":[{"internalType":"contract DIDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userMemberships","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userProfiles","outputs":[{"internalType":"string","name":"persona","type":"string"},{"internalType":"uint256","name":"xp","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPublicKeys","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"}] as const

// FIXED TYPES - Match actual ABI structure
export type ContractUserProfile = {
  persona: string
  xp: bigint
  level: bigint
  badges: string[]  // badges are included in getUserProfile now
  createdAt: bigint
}

export type CommunityRequirements = {
  minXp: bigint
  requiredBadges: string[]
  isActive: boolean
}

export interface UseDIDManagerOptions {
  contractAddress: Address
  chainId?: number
  enabled?: boolean
}

// SEPARATE HOOKS - These are used directly in components, following Rules of Hooks
export function useUserProfile(contractAddress: Address, userTokenId: bigint | undefined, options?: { chainId?: number; enabled?: boolean }) {
  const { chainId, enabled = true } = options || {}
  
  return useReadContract({
    address: contractAddress,
    abi: DID_MANAGER_ABI,
    functionName: 'getUserProfile',
    args: userTokenId ? [userTokenId] : undefined,
    chainId,
    query: {
      enabled: enabled && !!userTokenId,
    },
  })
}

export function usePublicKey(contractAddress: Address, userTokenId: bigint | undefined, options?: { chainId?: number; enabled?: boolean }) {
  const { chainId, enabled = true } = options || {}
  
  return useReadContract({
    address: contractAddress,
    abi: DID_MANAGER_ABI,
    functionName: 'getPublicKey',
    args: userTokenId ? [userTokenId] : undefined,
    chainId,
    query: {
      enabled: enabled && !!userTokenId,
    },
  })
}

export function useCommunityRequirements(contractAddress: Address, communityTokenId: bigint | undefined, options?: { chainId?: number; enabled?: boolean }) {
  const { chainId, enabled = true } = options || {}
  
  return useReadContract({
    address: contractAddress,
    abi: DID_MANAGER_ABI,
    functionName: 'getCommunityRequirements',
    args: communityTokenId ? [communityTokenId] : undefined,
    chainId,
    query: {
      enabled: enabled && !!communityTokenId,
    },
  })
}

// WRITE-ONLY HOOK
export function useDIDManager({ contractAddress, chainId, enabled = true }: UseDIDManagerOptions) {
  const { address } = useAccount()
  
  const mintUserDIDWrite = useWriteContract()
  const mintCommunityDIDWrite = useWriteContract()
  const addXPToUserWrite = useWriteContract()
  const addBadgeToUserWrite = useWriteContract()
  const fuseWithCommunityWrite = useWriteContract()

  const mintUserDID = useMemo(() => ({
    writeAsync: async ({ tokenId, to, publicKey, persona }: { 
      tokenId: bigint
      to: Address
      publicKey: string 
      persona: string 
    }) => {
      if (!enabled) throw new Error("Hook is disabled")
      if (!address) throw new Error("Wallet not connected")
      
      // Convert string to bytes32
      const publicKeyBytes32 = publicKey.startsWith('0x') ? publicKey as `0x${string}` : `0x${publicKey}` as `0x${string}`
      
      return mintUserDIDWrite.writeContractAsync({
        address: contractAddress,
        abi: DID_MANAGER_ABI,
        functionName: 'mintUserDID',
        args: [tokenId, to, publicKeyBytes32, persona],
        chainId,
      })
    },
    isPending: mintUserDIDWrite.isPending,
    error: mintUserDIDWrite.error,
    isSuccess: mintUserDIDWrite.isSuccess,
  }), [mintUserDIDWrite, contractAddress, chainId, enabled, address])

  const addXPToUser = useMemo(() => ({
    writeAsync: async ({ userTokenId, xpToAdd }: { userTokenId: bigint; xpToAdd: bigint }) => {
      if (!enabled) throw new Error("Hook is disabled")
      if (!address) throw new Error("Wallet not connected")
      
      return addXPToUserWrite.writeContractAsync({
        address: contractAddress,
        abi: DID_MANAGER_ABI,
        functionName: 'addXPToUser',
        args: [userTokenId, xpToAdd],
        chainId,
      })
    },
    isPending: addXPToUserWrite.isPending,
    error: addXPToUserWrite.error,
    isSuccess: addXPToUserWrite.isSuccess,
  }), [addXPToUserWrite, contractAddress, chainId, enabled, address])

  const addBadgeToUser = useMemo(() => ({
    writeAsync: async ({ userTokenId, badge }: { userTokenId: bigint; badge: string }) => {
      if (!enabled) throw new Error("Hook is disabled")
      if (!address) throw new Error("Wallet not connected")
      
      return addBadgeToUserWrite.writeContractAsync({
        address: contractAddress,
        abi: DID_MANAGER_ABI,
        functionName: 'addBadgeToUser',
        args: [userTokenId, badge],
        chainId,
      })
    },
    isPending: addBadgeToUserWrite.isPending,
    error: addBadgeToUserWrite.error,
    isSuccess: addBadgeToUserWrite.isSuccess,
  }), [addBadgeToUserWrite, contractAddress, chainId, enabled, address])

  const fuseWithCommunity = useMemo(() => ({
    writeAsync: async ({ userTokenId, communityTokenId }: { userTokenId: bigint; communityTokenId: bigint }) => {
      if (!enabled) throw new Error("Hook is disabled")
      if (!address) throw new Error("Wallet not connected")
      
      return fuseWithCommunityWrite.writeContractAsync({
        address: contractAddress,
        abi: DID_MANAGER_ABI,
        functionName: 'fuseWithCommunity',
        args: [userTokenId, communityTokenId],
        chainId,
      })
    },
    isPending: fuseWithCommunityWrite.isPending,
    error: fuseWithCommunityWrite.error,
    isSuccess: fuseWithCommunityWrite.isSuccess,
  }), [fuseWithCommunityWrite, contractAddress, chainId, enabled, address])

  return {
    isConnected: !!address,
    address,
    mintUserDID,
    addXPToUser,
    addBadgeToUser,
    fuseWithCommunity,
  }
}
import type { UserProfile, CommunityRequirements } from "../types/did-manager"

// Helper functions for working with DID data
export class DIDHelpers {
  /**
   * Calculate user level based on XP
   */
  static calculateLevel(xp: bigint): number {
    // Example level calculation - adjust based on your game mechanics
    return Math.floor(Number(xp) / 1000) + 1
  }

  /**
   * Check if user meets community requirements
   */
  static meetsRequirements(userProfile: UserProfile, requirements: CommunityRequirements): boolean {
    // Check XP requirement
    if (userProfile.xp < requirements.minXp) {
      return false
    }

    // Check badge requirements
    for (const requiredBadge of requirements.requiredBadges) {
      if (!userProfile.badges.includes(requiredBadge)) {
        return false
      }
    }

    return requirements.isActive
  }

  /**
   * Format XP for display
   */
  static formatXP(xp: bigint): string {
    const xpNumber = Number(xp)
    if (xpNumber >= 1000000) {
      return `${(xpNumber / 1000000).toFixed(1)}M XP`
    } else if (xpNumber >= 1000) {
      return `${(xpNumber / 1000).toFixed(1)}K XP`
    }
    return `${xpNumber} XP`
  }

  /**
   * Generate a short address for display
   */
  static shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  /**
   * Convert bytes32 to hex string
   */
  static bytes32ToHex(bytes32: string): string {
    return bytes32.startsWith("0x") ? bytes32 : `0x${bytes32}`
  }

  /**
   * Validate token ID
   */
  static isValidTokenId(tokenId: bigint): boolean {
    return tokenId > 0n
  }
}

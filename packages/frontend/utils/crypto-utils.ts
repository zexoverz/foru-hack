import { keccak256, toHex } from "viem"

export class CryptoUtils {
  /**
   * Generate a public key using keccak256 hash
   * @param input - Input string to hash (can be wallet address, timestamp, or custom input)
   * @returns Public key as hex string
   */
  static generatePublicKey(input: string): string {
    // Create a more unique input by combining with timestamp
    const uniqueInput = `${input}-${Date.now()}-${Math.random()}`

    // Hash the input using keccak256
    const hash = keccak256(toHex(uniqueInput))

    // Return the hash as public key (remove 0x prefix and take first 64 chars for standard key length)
    return hash.slice(2, 66)
  }

  /**
   * Generate public key from wallet address
   * @param walletAddress - Connected wallet address
   * @returns Public key as hex string
   */
  static generatePublicKeyFromWallet(walletAddress: string): string {
    return this.generatePublicKey(walletAddress)
  }

  /**
   * Validate public key format
   * @param publicKey - Public key to validate
   * @returns Boolean indicating if key is valid
   */
  static isValidPublicKey(publicKey: string): boolean {
    // Remove 0x prefix if present
    const cleanKey = publicKey.startsWith("0x") ? publicKey.slice(2) : publicKey

    // Check if it's a valid hex string of correct length (64 characters for 32 bytes)
    return /^[a-fA-F0-9]{64}$/.test(cleanKey)
  }

  /**
   * Format public key with 0x prefix
   * @param publicKey - Public key to format
   * @returns Formatted public key with 0x prefix
   */
  static formatPublicKey(publicKey: string): string {
    const cleanKey = publicKey.startsWith("0x") ? publicKey.slice(2) : publicKey
    return `0x${cleanKey}`
  }
}

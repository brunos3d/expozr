/**
 * Checksum generation utilities
 */

/**
 * Utility class for generating checksums and hashes
 */
export class ChecksumUtils {
  /**
   * Generate a checksum for data integrity verification
   */
  static generate(data: any): string {
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Generate an async checksum using Web Crypto API (browser) or crypto module (Node.js)
   */
  static async generateAsync(data: any): Promise<string> {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());

    if (typeof crypto !== "undefined" && crypto.subtle) {
      // Browser environment with Web Crypto API
      return this.generateWebCryptoHash(jsonString);
    } else if (typeof require !== "undefined") {
      // Node.js environment
      return this.generateNodeCryptoHash(jsonString);
    } else {
      // Fallback to synchronous method
      return this.generate(data);
    }
  }

  /**
   * Generate hash using Web Crypto API (browser)
   */
  private static async generateWebCryptoHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Generate hash using Node.js crypto module
   */
  private static generateNodeCryptoHash(data: string): string {
    try {
      const crypto = require("crypto");
      return crypto.createHash("sha256").update(data).digest("hex");
    } catch {
      // Fallback if crypto module is not available
      return this.generateSimpleHash(data);
    }
  }

  /**
   * Simple hash function as fallback
   */
  private static generateSimpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verify checksum integrity
   */
  static verify(data: any, expectedChecksum: string): boolean {
    const actualChecksum = this.generate(data);
    return actualChecksum === expectedChecksum;
  }

  /**
   * Generate a short checksum for quick comparison
   */
  static generateShort(data: any, length: number = 8): string {
    const fullChecksum = this.generate(data);
    return fullChecksum.substring(0, length);
  }
}

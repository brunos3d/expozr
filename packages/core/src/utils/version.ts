/**
 * Version and semantic versioning utilities
 */

/**
 * Utility class for semantic version operations
 */
export class VersionUtils {
  /**
   * Validate semantic version string
   */
  static isValid(version: string): boolean {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  /**
   * Parse semantic version into components
   */
  static parse(version: string): {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
    buildMetadata?: string;
  } | null {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    const match = version.match(semverRegex);

    if (!match) {
      return null;
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      buildMetadata: match[5],
    };
  }

  /**
   * Compare two semantic versions
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  static compare(version1: string, version2: string): number {
    const v1 = this.parse(version1);
    const v2 = this.parse(version2);

    if (!v1 || !v2) {
      throw new Error("Invalid version format");
    }

    // Compare major.minor.patch
    if (v1.major !== v2.major) {
      return v1.major - v2.major;
    }
    if (v1.minor !== v2.minor) {
      return v1.minor - v2.minor;
    }
    if (v1.patch !== v2.patch) {
      return v1.patch - v2.patch;
    }

    // Compare prerelease versions
    if (v1.prerelease && !v2.prerelease) return -1;
    if (!v1.prerelease && v2.prerelease) return 1;
    if (v1.prerelease && v2.prerelease) {
      return v1.prerelease.localeCompare(v2.prerelease);
    }

    return 0;
  }

  /**
   * Check if a version satisfies a constraint
   */
  static satisfies(version: string, constraint: string): boolean {
    if (constraint === "*") {
      return true;
    }

    if (constraint.startsWith("^")) {
      return this.satisfiesCaretRange(version, constraint.slice(1));
    }

    if (constraint.startsWith("~")) {
      return this.satisfiesTildeRange(version, constraint.slice(1));
    }

    if (constraint.startsWith(">=")) {
      const targetVersion = constraint.slice(2).trim();
      return this.compare(version, targetVersion) >= 0;
    }

    if (constraint.startsWith("<=")) {
      const targetVersion = constraint.slice(2).trim();
      return this.compare(version, targetVersion) <= 0;
    }

    if (constraint.startsWith(">")) {
      const targetVersion = constraint.slice(1).trim();
      return this.compare(version, targetVersion) > 0;
    }

    if (constraint.startsWith("<")) {
      const targetVersion = constraint.slice(1).trim();
      return this.compare(version, targetVersion) < 0;
    }

    // Exact match
    return version === constraint;
  }

  /**
   * Check if version satisfies caret range (^1.2.3)
   */
  private static satisfiesCaretRange(
    version: string,
    constraint: string
  ): boolean {
    const v = this.parse(version);
    const c = this.parse(constraint);

    if (!v || !c) {
      return false;
    }

    // Same major version, greater or equal minor.patch
    return v.major === c.major && this.compare(version, constraint) >= 0;
  }

  /**
   * Check if version satisfies tilde range (~1.2.3)
   */
  private static satisfiesTildeRange(
    version: string,
    constraint: string
  ): boolean {
    const v = this.parse(version);
    const c = this.parse(constraint);

    if (!v || !c) {
      return false;
    }

    // Same major.minor version, greater or equal patch
    return (
      v.major === c.major &&
      v.minor === c.minor &&
      this.compare(version, constraint) >= 0
    );
  }

  /**
   * Get the latest version from an array of versions
   */
  static getLatest(versions: string[]): string | null {
    if (versions.length === 0) {
      return null;
    }

    return (
      versions.filter(this.isValid).sort((a, b) => this.compare(b, a))[0] ||
      null
    );
  }

  /**
   * Get all versions that satisfy a constraint
   */
  static getMatching(versions: string[], constraint: string): string[] {
    return versions.filter((version) => this.satisfies(version, constraint));
  }

  /**
   * Increment version by type
   */
  static increment(version: string, type: "major" | "minor" | "patch"): string {
    const parsed = this.parse(version);
    if (!parsed) {
      throw new Error("Invalid version format");
    }

    switch (type) {
      case "major":
        return `${parsed.major + 1}.0.0`;
      case "minor":
        return `${parsed.major}.${parsed.minor + 1}.0`;
      case "patch":
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
      default:
        throw new Error(`Invalid increment type: ${type}`);
    }
  }

  /**
   * Check if version is prerelease
   */
  static isPrerelease(version: string): boolean {
    const parsed = this.parse(version);
    return parsed ? !!parsed.prerelease : false;
  }

  /**
   * Check if version is stable (not prerelease)
   */
  static isStable(version: string): boolean {
    return !this.isPrerelease(version);
  }
}

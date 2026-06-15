/**
 * File Permission Manager for secure configuration file access
 * 
 * Features:
 * - Cross-platform permission management (Linux/macOS/Windows)
 * - Automatic permission validation and repair
 * - Security warnings and guidance
 * - Permission verification checks
 * 
 * @fileoverview File permission management for story 6.4
 * @author Development Team
 * @since 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * File permission information
 */
export interface FilePermissionInfo {
  /** File path */
  path: string;
  /** Current permission mode (octal) */
  mode: number;
  /** Whether permissions are secure */
  isSecure: boolean;
  /** Platform-specific permission description */
  description: string;
  /** Warning messages if any */
  warnings: string[];
}

/**
 * Permission validation result
 */
export interface PermissionValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation message */
  message: string;
  /** Recommended actions */
  recommendations: string[];
  /** Current permission info */
  permissionInfo?: FilePermissionInfo;
}

/**
 * Permission repair result
 */
export interface PermissionRepairResult {
  /** Whether repair was successful */
  success: boolean;
  /** Repair message */
  message: string;
  /** Previous permission info */
  before?: FilePermissionInfo;
  /** New permission info */
  after?: FilePermissionInfo;
}

/**
 * Secure permission constants
 */
const SECURE_PERMISSIONS = {
  /** Owner read/write only (octal 600) */
  OWNER_RW: 0o600,
  /** Owner read/write/execute (octal 700) for directories */
  OWNER_RWX: 0o700
} as const;

/**
 * File Permission Manager implementation
 */
export class FilePermissionManager {
  private readonly platform: NodeJS.Platform;

  /**
   * Initialize FilePermissionManager
   */
  constructor() {
    this.platform = os.platform();
  }

  /**
   * Check if current platform supports Unix-style permissions
   * @returns True if platform supports chmod
   */
  private supportsUnixPermissions(): boolean {
    return this.platform !== 'win32';
  }

  /**
   * Get file permission information
   * @param filePath Path to file or directory
   * @returns Permission information
   */
  public getPermissionInfo(filePath: string): FilePermissionInfo {
    try {
      const stats = fs.statSync(filePath);
      const mode = stats.mode & parseInt('777', 8); // Extract permission bits
      const isSecure = this.isPermissionSecure(mode, stats.isDirectory());
      
      return {
        path: filePath,
        mode,
        isSecure,
        description: this.describePermissions(mode),
        warnings: this.generatePermissionWarnings(mode, stats.isDirectory())
      };
    } catch (error) {
      throw new Error(`Failed to get permission info for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if permission mode is secure
   * @param mode Permission mode
   * @param isDirectory Whether the target is a directory
   * @returns True if permissions are secure
   */
  private isPermissionSecure(mode: number, isDirectory: boolean): boolean {
    if (!this.supportsUnixPermissions()) {
      // On Windows, we rely on NTFS permissions which are generally secure by default
      return true;
    }

    const expectedMode = isDirectory ? SECURE_PERMISSIONS.OWNER_RWX : SECURE_PERMISSIONS.OWNER_RW;
    
    // Check if permissions are exactly what we expect (owner only)
    return mode === expectedMode;
  }

  /**
   * Describe permission mode in human-readable format
   * @param mode Permission mode
   * @returns Human-readable description
   */
  private describePermissions(mode: number): string {
    if (!this.supportsUnixPermissions()) {
      return 'Windows NTFS permissions (managed by system)';
    }

    const owner = this.formatPermissionGroup((mode >> 6) & 7);
    const group = this.formatPermissionGroup((mode >> 3) & 7);
    const others = this.formatPermissionGroup(mode & 7);

    return `Owner: ${owner}, Group: ${group}, Others: ${others} (${mode.toString(8)})`;
  }

  /**
   * Format permission group (rwx format)
   * @param perms Permission bits for a group
   * @returns Formatted permission string
   */
  private formatPermissionGroup(perms: number): string {
    const read = (perms & 4) ? 'r' : '-';
    const write = (perms & 2) ? 'w' : '-';
    const execute = (perms & 1) ? 'x' : '-';
    return `${read}${write}${execute}`;
  }

  /**
   * Generate permission warnings
   * @param mode Permission mode
   * @param isDirectory Whether the target is a directory
   * @returns Array of warning messages
   */
  private generatePermissionWarnings(mode: number, _isDirectory: boolean): string[] {
    const warnings: string[] = [];

    if (!this.supportsUnixPermissions()) {
      return warnings; // No warnings for Windows
    }

    // Check group permissions
    const groupPerms = (mode >> 3) & 7;
    if (groupPerms > 0) {
      warnings.push('Group has access permissions - configuration file should be accessible only by owner');
    }

    // Check other permissions
    const otherPerms = mode & 7;
    if (otherPerms > 0) {
      warnings.push('Others have access permissions - configuration file should be accessible only by owner');
    }

    // Check if file is world-readable
    if (otherPerms & 4) {
      warnings.push('SECURITY RISK: Configuration file is world-readable');
    }

    // Check if file is world-writable
    if (otherPerms & 2) {
      warnings.push('CRITICAL SECURITY RISK: Configuration file is world-writable');
    }

    return warnings;
  }

  /**
   * Validate file permissions
   * @param filePath Path to file or directory
   * @returns Validation result
   */
  public validatePermissions(filePath: string): PermissionValidationResult {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          isValid: false,
          message: `File does not exist: ${filePath}`,
          recommendations: ['Create the configuration file first']
        };
      }

      const permissionInfo = this.getPermissionInfo(filePath);
      const recommendations: string[] = [];

      if (!permissionInfo.isSecure) {
        if (this.supportsUnixPermissions()) {
          recommendations.push(`Run: chmod 600 ${filePath}`);
          recommendations.push('Or use: polyv-live-cli config fix-permissions');
        } else {
          recommendations.push('Ensure only your user account has access to the configuration file');
          recommendations.push('Check Windows file properties and remove other users\' access');
        }
      }

      if (permissionInfo.warnings.length > 0) {
        recommendations.push('Review and fix permission warnings above');
      }

      return {
        isValid: permissionInfo.isSecure && permissionInfo.warnings.length === 0,
        message: permissionInfo.isSecure 
          ? 'File permissions are secure' 
          : 'File permissions are not secure - configuration file should only be accessible by owner',
        recommendations,
        permissionInfo
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Failed to validate permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Check if file exists and is accessible']
      };
    }
  }

  /**
   * Set secure permissions on file or directory
   * @param filePath Path to file or directory
   * @param isDirectory Whether the target is a directory
   * @returns Success status
   */
  public setSecurePermissions(filePath: string, isDirectory: boolean = false): PermissionRepairResult {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: `Cannot set permissions: File does not exist: ${filePath}`
        };
      }

      const before = this.getPermissionInfo(filePath);

      if (!this.supportsUnixPermissions()) {
        // On Windows, we can't use chmod effectively
        // The file system should handle permissions appropriately
        return {
          success: true,
          message: 'Windows NTFS permissions are managed by the system. Ensure only your user account has access.',
          before,
          after: before // Permissions don't change on Windows
        };
      }

      // Set appropriate permissions for Unix-like systems
      const targetMode = isDirectory ? SECURE_PERMISSIONS.OWNER_RWX : SECURE_PERMISSIONS.OWNER_RW;
      fs.chmodSync(filePath, targetMode);

      const after = this.getPermissionInfo(filePath);

      return {
        success: true,
        message: `Successfully set secure permissions (${targetMode.toString(8)}) on ${filePath}`,
        before,
        after
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set secure permissions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Ensure directory has secure permissions
   * @param dirPath Directory path
   * @returns Operation result
   */
  public ensureSecureDirectory(dirPath: string): PermissionRepairResult {
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        const parentDir = path.dirname(dirPath);
        if (!fs.existsSync(parentDir)) {
          // Recursively create parent directories
          fs.mkdirSync(parentDir, { recursive: true, mode: SECURE_PERMISSIONS.OWNER_RWX });
        }
        fs.mkdirSync(dirPath, { mode: SECURE_PERMISSIONS.OWNER_RWX });
      }

      return this.setSecurePermissions(dirPath, true);
    } catch (error) {
      return {
        success: false,
        message: `Failed to ensure secure directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Repair permissions for configuration file
   * @param filePath Configuration file path
   * @returns Repair result
   */
  public repairConfigurationFile(filePath: string): PermissionRepairResult {
    try {
      // Ensure parent directory exists and is secure
      const dirPath = path.dirname(filePath);
      const dirResult = this.ensureSecureDirectory(dirPath);
      
      if (!dirResult.success) {
        return {
          success: false,
          message: `Failed to secure parent directory: ${dirResult.message}`
        };
      }

      // Set secure permissions on the file if it exists
      if (fs.existsSync(filePath)) {
        return this.setSecurePermissions(filePath, false);
      } else {
        return {
          success: true,
          message: `Parent directory secured. Configuration file ${filePath} will be created with secure permissions.`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to repair configuration file permissions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if file has been tampered with based on permissions
   * @param filePath File path to check
   * @returns True if file might have been tampered with
   */
  public detectPotentialTampering(filePath: string): {
    isTampered: boolean;
    reasons: string[];
    recommendations: string[];
  } {
    const reasons: string[] = [];
    const recommendations: string[] = [];

    try {
      if (!fs.existsSync(filePath)) {
        return {
          isTampered: false,
          reasons: ['File does not exist'],
          recommendations: ['Create configuration file if needed']
        };
      }

      const permissionInfo = this.getPermissionInfo(filePath);

      // Check for suspicious permissions
      if (permissionInfo.warnings.length > 0) {
        reasons.push('Insecure file permissions detected');
        reasons.push(...permissionInfo.warnings);
        recommendations.push('Run permission repair: polyv-live-cli config fix-permissions');
      }

      if (this.supportsUnixPermissions()) {
        const mode = permissionInfo.mode;
        
        // Check for world-writable
        if (mode & 2) {
          reasons.push('File is world-writable - possible tampering risk');
          recommendations.push('Immediately secure the file with: chmod 600 ' + filePath);
        }

        // Check for group-writable
        if (mode & 0o020) {
          reasons.push('File is group-writable - possible unauthorized access');
          recommendations.push('Remove group write access');
        }
      }

      return {
        isTampered: reasons.length > 0,
        reasons,
        recommendations
      };
    } catch (error) {
      return {
        isTampered: true,
        reasons: [`Error checking file permissions: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Verify file exists and is accessible']
      };
    }
  }

  /**
   * Get platform-specific security recommendations
   * @returns Array of security recommendations
   */
  public getSecurityRecommendations(): string[] {
    const recommendations: string[] = [
      'Keep your configuration file in a secure location',
      'Regularly backup your configuration file',
      'Use the POLYV_MASTER_KEY environment variable for additional security'
    ];

    if (this.supportsUnixPermissions()) {
      recommendations.push(
        'Ensure configuration file permissions are set to 600 (owner read/write only)',
        'Configuration directory permissions should be 700 (owner access only)',
        'Use "ls -la" to check file permissions'
      );
    } else {
      recommendations.push(
        'On Windows, ensure only your user account has access to the configuration file',
        'Use Windows file properties to review and manage access permissions',
        'Consider using Windows folder encryption for additional security'
      );
    }

    return recommendations;
  }
}

/**
 * Default file permission manager instance
 */
export const defaultFilePermissionManager = new FilePermissionManager();
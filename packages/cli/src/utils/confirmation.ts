/**
 * @fileoverview Interactive confirmation utilities for CLI operations
 * @author Development Team
 * @since 2.5.0
 */

import * as readline from 'readline';
import { ConfirmationResponse } from '../types/channel';

/**
 * Prompts user for confirmation with timeout support
 * @param message Confirmation message to display
 * @param expectedInput Expected confirmation input (default: 'yes')
 * @param timeoutMs Timeout in milliseconds (default: 30000)
 * @returns Promise resolving to whether user confirmed
 * 
 * @throws {Error} When running in non-TTY environment without force flag
 * @throws {Error} When confirmation times out
 * 
 * @example
 * ```typescript
 * const confirmed = await confirmDeletion(
 *   'Are you sure you want to delete this channel?',
 *   'yes'
 * );
 * if (confirmed) {
 *   console.log('User confirmed deletion');
 * }
 * ```
 */
export async function confirmDeletion(
  message: string,
  expectedInput: string = 'yes',
  timeoutMs: number = 30000
): Promise<boolean> {
  // Check if we're in a TTY environment
  if (!process.stdin.isTTY) {
    throw new Error(
      'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
    );
  }

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Set up timeout
    const timeoutId = setTimeout(() => {
      rl.close();
      reject(new Error(`Confirmation timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);

    // Display confirmation message
    console.log(`\n🚨 ${message}`);
    console.log(`Type '${expectedInput}' to confirm, or anything else to cancel:`);

    rl.question('> ', (answer) => {
      clearTimeout(timeoutId);
      rl.close();

      const normalizedAnswer = answer.trim().toLowerCase();
      const normalizedExpected = expectedInput.toLowerCase();
      
      // Check for various forms of confirmation
      const confirmed = 
        normalizedAnswer === normalizedExpected ||
        normalizedAnswer === 'y' ||
        normalizedAnswer === 'yes';

      if (confirmed) {
        console.log('✅ Confirmed. Proceeding with operation...\n');
      } else {
        console.log('❌ Cancelled. Operation aborted.\n');
      }

      resolve(confirmed);
    });

    // Handle Ctrl+C gracefully
    rl.on('SIGINT', () => {
      clearTimeout(timeoutId);
      rl.close();
      console.log('\n❌ Operation cancelled by user (Ctrl+C)\n');
      resolve(false);
    });
  });
}

/**
 * Prompts user for general confirmation with custom options
 * @param message Confirmation message to display
 * @param options Confirmation options
 * @returns Promise resolving to confirmation response
 * 
 * @example
 * ```typescript
 * const response = await promptConfirmation(
 *   'Do you want to proceed?',
 *   {
 *     acceptedInputs: ['yes', 'y', 'ok'],
 *     rejectedInputs: ['no', 'n', 'cancel'],
 *     timeout: 60000,
 *     caseSensitive: false
 *   }
 * );
 * ```
 */
export async function promptConfirmation(
  message: string,
  options: {
    acceptedInputs?: string[];
    rejectedInputs?: string[];
    timeout?: number;
    caseSensitive?: boolean;
  } = {}
): Promise<ConfirmationResponse> {
  const {
    acceptedInputs = ['yes', 'y'],
    rejectedInputs = ['no', 'n'],
    timeout = 30000,
    caseSensitive = false
  } = options;

  // Check if we're in a TTY environment
  if (!process.stdin.isTTY) {
    throw new Error(
      'Interactive confirmation not available in non-TTY environment.'
    );
  }

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Set up timeout
    const timeoutId = setTimeout(() => {
      rl.close();
      reject(new Error(`Confirmation timed out after ${timeout / 1000} seconds`));
    }, timeout);

    // Display confirmation message and options
    console.log(`\n${message}`);
    console.log(`Accepted inputs: ${acceptedInputs.join(', ')}`);
    console.log(`Rejected inputs: ${rejectedInputs.join(', ')}`);

    rl.question('> ', (answer) => {
      clearTimeout(timeoutId);
      rl.close();

      const processedAnswer = caseSensitive ? answer.trim() : answer.trim().toLowerCase();
      const processedAccepted = caseSensitive 
        ? acceptedInputs 
        : acceptedInputs.map(input => input.toLowerCase());
      const processedRejected = caseSensitive 
        ? rejectedInputs 
        : rejectedInputs.map(input => input.toLowerCase());

      let confirmed: boolean;
      
      if (processedAccepted.includes(processedAnswer)) {
        confirmed = true;
        console.log('✅ Confirmed. Proceeding with operation...\n');
      } else if (processedRejected.includes(processedAnswer)) {
        confirmed = false;
        console.log('❌ Cancelled. Operation aborted.\n');
      } else {
        confirmed = false;
        console.log(`❓ Invalid input: "${answer}". Operation cancelled.\n`);
      }

      resolve({
        confirmed,
        input: answer.trim()
      });
    });

    // Handle Ctrl+C gracefully
    rl.on('SIGINT', () => {
      clearTimeout(timeoutId);
      rl.close();
      console.log('\n❌ Operation cancelled by user (Ctrl+C)\n');
      resolve({
        confirmed: false,
        input: ''
      });
    });
  });
}

/**
 * Checks if the current environment supports interactive input
 * @returns True if interactive input is supported
 */
export function isInteractiveEnvironment(): boolean {
  return process.stdin.isTTY === true;
}

/**
 * Validates that confirmation is possible in the current environment
 * @param requireForce Whether to require force flag in non-interactive environments
 * @param forceFlag Whether the force flag is set
 * @throws {Error} When confirmation is not possible and force is not used
 */
export function validateConfirmationEnvironment(requireForce: boolean = true, forceFlag: boolean = false): void {
  if (!isInteractiveEnvironment() && requireForce && !forceFlag) {
    throw new Error(
      'Interactive confirmation not available in non-TTY environment. Use --force flag to bypass confirmation.'
    );
  }
}

/**
 * Creates a confirmation prompt for dangerous operations
 * @param operationName Name of the operation (e.g., 'delete channel')
 * @param resourceId ID of the resource being affected
 * @param additionalWarnings Additional warning messages
 * @returns Promise resolving to confirmation result
 * 
 * @example
 * ```typescript
 * const confirmed = await confirmDangerousOperation(
 *   'delete channel',
 *   '3151318',
 *   ['This will permanently remove all channel data', 'Streaming history will be lost']
 * );
 * ```
 */
export async function confirmDangerousOperation(
  operationName: string,
  resourceId: string,
  additionalWarnings: string[] = []
): Promise<boolean> {
  console.log('\n' + '='.repeat(60));
  console.log('🚨 DANGEROUS OPERATION WARNING 🚨');
  console.log('='.repeat(60));
  console.log(`Operation: ${operationName.toUpperCase()}`);
  console.log(`Resource: ${resourceId}`);
  console.log('='.repeat(60));
  
  if (additionalWarnings.length > 0) {
    console.log('\nWarnings:');
    additionalWarnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  console.log('\nThis action is IRREVERSIBLE and cannot be undone.');
  console.log('All data associated with this resource will be permanently lost.');
  
  const confirmed = await confirmDeletion(
    `Type 'yes' to confirm ${operationName} for ${resourceId}`,
    'yes',
    60000 // 60 second timeout for dangerous operations
  );
  
  console.log('='.repeat(60));
  
  return confirmed;
}
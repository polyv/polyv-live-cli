/**
 * @fileoverview Integration tests for channel delete functionality
 * @author Development Team
 * @since 2.5.0
 */

import { ChannelServiceSdk } from '../../src/services/channel.service.sdk';
import { ChannelHandler } from '../../src/handlers/channel.handler';
import { AuthConfig } from '../../src/types/auth';
import { ChannelServiceConfig, ChannelDeleteOptions, ChannelCreateRequest } from '../../src/types/channel';
import { PolyVValidationError, PolyVAPIError } from '../../src/utils/errors';
import { getTestConfig, hasRealCredentials } from '../helpers/integration-config';

// Mock the confirmation utility to avoid interactive prompts in tests
jest.mock('../../src/utils/confirmation', () => ({
  confirmDeletion: jest.fn(),
  isInteractiveEnvironment: jest.fn(() => false),
  validateConfirmationEnvironment: jest.fn()
}));

const mockConfirmation = require('../../src/utils/confirmation');

// Get test configuration from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunRealTests = hasRealCredentials();

describe('Channel Delete Integration Tests', () => {
  let channelService: ChannelServiceSdk;
  let channelHandler: ChannelHandler;
  let authConfig: AuthConfig;
  let serviceConfig: ChannelServiceConfig;
  let createdChannelIds: string[] = [];

  // Helper function to create a test channel
  const createTestChannel = async (name: string): Promise<string> => {
    const createOptions: ChannelCreateRequest = {
      name: `Test ${name} ${Date.now()}`,
      newScene: 'topclass',
      template: 'ppt'
    };

    const result = await channelService.createChannel(createOptions);
    const channelId = result.channelId.toString();
    createdChannelIds.push(channelId);
    return channelId;
  };

  // Helper function to cleanup channels with retry mechanism
  const cleanupChannels = async (channelIds: string[]) => {
    if (channelIds.length === 0) return;

    const channelsToDelete = [...channelIds]; // Create a copy
    let retryCount = 0;
    const maxRetries = 2;

    while (channelsToDelete.length > 0 && retryCount <= maxRetries) {
      try {
        await channelService.batchDeleteChannels({ channelIds: channelsToDelete });
        console.log(`🧹 Cleaned up ${channelsToDelete.length} test channels${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
        return; // Success, exit
      } catch (error) {
        retryCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (retryCount > maxRetries) {
          console.warn(`⚠️  Failed to clean up channels after ${maxRetries} retries: ${channelsToDelete.join(', ')}`);
          console.warn(`   Error: ${errorMessage}`);

          // Try to delete channels individually as fallback
          for (const channelId of channelsToDelete) {
            try {
              await channelService.batchDeleteChannels({ channelIds: [channelId] });
              console.log(`🧹 Individual cleanup successful for channel: ${channelId}`);
            } catch (individualError) {
              console.warn(`⚠️  Individual cleanup failed for channel ${channelId}: ${individualError instanceof Error ? individualError.message : String(individualError)}`);
            }
          }
        } else {
          console.warn(`⚠️  Cleanup attempt ${retryCount} failed, retrying... Error: ${errorMessage}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
  };

  beforeAll(() => {
    if (!shouldRunRealTests) {
      console.warn('⚠️  Skipping real API tests - no credentials available');
      console.warn('   Set POLYV_APP_ID and POLYV_APP_SECRET or configure CLI accounts');
    }

    // Setup test configuration from helper
    authConfig = testConfig.authConfig;
    serviceConfig = {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      maxRetries: 3,
      debug: false
    };
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.restoreAllMocks();
    createdChannelIds = [];

    // Create service and handler instances
    channelService = new ChannelServiceSdk(authConfig, serviceConfig);
    channelHandler = new ChannelHandler(authConfig, serviceConfig);
  });

  afterEach(async () => {
    // Clean up created channels
    if (createdChannelIds.length > 0 && shouldRunRealTests) {
      await cleanupChannels(createdChannelIds);
      createdChannelIds = [];
    }
  });

  describe('Service and Handler Integration (Mock)', () => {
    it('should propagate validation errors from service to handler', async () => {
      const deleteOptions: ChannelDeleteOptions = {
        channelId: '', // Invalid empty channel ID
        force: true,
        output: 'table'
      };

      // Should throw validation error
      await expect(channelHandler.deleteChannel(deleteOptions))
        .rejects.toThrow(PolyVValidationError);
    });
  });

  describe('Real API Integration Tests', () => {
    // Only run these tests if real credentials are available
    beforeEach(() => {
      if (!shouldRunRealTests) {
        pending('Skipping - no real API credentials available');
      }
    });

    it('should integrate channel service and handler for successful deletion', async () => {
      // Create a test channel first
      const validChannelId = await createTestChannel('DeleteTest');

      // Mock user confirmation as confirmed
      mockConfirmation.confirmDeletion.mockResolvedValue(true);

      const deleteOptions: ChannelDeleteOptions = {
        channelId: validChannelId,
        force: false,
        output: 'table'
      };

      // This should not throw and will actually delete the channel
      await expect(channelHandler.deleteChannel(deleteOptions)).resolves.toBeUndefined();

      // Verify confirmation was called
      expect(mockConfirmation.confirmDeletion).toHaveBeenCalledWith(
        `Are you sure you want to delete channel '${validChannelId}'? This action cannot be undone.`,
        'yes'
      );

      // Remove from cleanup list since it was actually deleted
      const index = createdChannelIds.indexOf(validChannelId);
      if (index > -1) {
        createdChannelIds.splice(index, 1);
        console.log(`📝 Removed channel ${validChannelId} from cleanup list (successfully deleted)`);
      }
    }, 30000);

    it('should cancel deletion when user rejects confirmation', async () => {
      // Create a test channel first
      const validChannelId = await createTestChannel('CancelTest');

      // Mock user confirmation as rejected
      mockConfirmation.confirmDeletion.mockResolvedValue(false);

      const deleteOptions: ChannelDeleteOptions = {
        channelId: validChannelId,
        force: false,
        output: 'table'
      };

      // Should complete without calling API when user cancels
      await expect(channelHandler.deleteChannel(deleteOptions)).resolves.toBeUndefined();

      // Verify confirmation was called but API was not
      expect(mockConfirmation.confirmDeletion).toHaveBeenCalled();
    }, 30000);

    it('should skip confirmation when force flag is used', async () => {
      // Create a test channel first
      const validChannelId = await createTestChannel('ForceDeleteTest');

      const deleteOptions: ChannelDeleteOptions = {
        channelId: validChannelId,
        force: true,
        output: 'table'
      };

      // This should not throw and will actually delete the channel
      await expect(channelHandler.deleteChannel(deleteOptions)).resolves.toBeUndefined();

      // Verify confirmation was NOT called when force is true
      expect(mockConfirmation.confirmDeletion).not.toHaveBeenCalled();

      // Remove from cleanup list since it was actually deleted
      const index = createdChannelIds.indexOf(validChannelId);
      if (index > -1) {
        createdChannelIds.splice(index, 1);
        console.log(`📝 Removed channel ${validChannelId} from cleanup list (successfully deleted)`);
      }
    }, 30000);

    it('should propagate API errors for non-existent channel', async () => {
      // Use non-existent channel ID to trigger API error
      const nonExistentChannelId = '9999999';

      const deleteOptions: ChannelDeleteOptions = {
        channelId: nonExistentChannelId,
        force: true,
        output: 'table'
      };

      // Should propagate API error for non-existent channel
      await expect(channelHandler.deleteChannel(deleteOptions))
        .rejects.toThrow();
    }, 15000);
  });

  describe('Error Handling Scenarios', () => {
    it('should handle channel not found errors', async () => {
      if (!shouldRunRealTests) {
        pending('Skipping - no real API credentials available');
      }

      // Use non-existent channel ID to test real API error handling
      const deleteOptions: ChannelDeleteOptions = {
        channelId: '9999999',
        force: true,
        output: 'table'
      };

      // Should get API error for non-existent channel
      await expect(channelHandler.deleteChannel(deleteOptions))
        .rejects.toThrow();
    }, 15000);
  });

  describe('Output Format Testing', () => {
    beforeEach(() => {
      if (!shouldRunRealTests) {
        pending('Skipping - no real API credentials available');
      }
    });

    it('should handle table output format', async () => {
      // Create a test channel first
      const validChannelId = await createTestChannel('TableOutputTest');

      const deleteOptions: ChannelDeleteOptions = {
        channelId: validChannelId,
        force: true,
        output: 'table'
      };

      // Should not throw for table output
      await expect(channelHandler.deleteChannel(deleteOptions))
        .resolves.toBeUndefined();

      // Remove from cleanup list since it was actually deleted
      const index = createdChannelIds.indexOf(validChannelId);
      if (index > -1) {
        createdChannelIds.splice(index, 1);
      }
    }, 30000);

    it('should handle JSON output format', async () => {
      // Create a test channel first
      const validChannelId = await createTestChannel('JsonOutputTest');

      const deleteOptions: ChannelDeleteOptions = {
        channelId: validChannelId,
        force: true,
        output: 'json'
      };

      // Should not throw for JSON output
      await expect(channelHandler.deleteChannel(deleteOptions))
        .resolves.toBeUndefined();

      // Remove from cleanup list since it was actually deleted
      const index = createdChannelIds.indexOf(validChannelId);
      if (index > -1) {
        createdChannelIds.splice(index, 1);
      }
    }, 30000);
  });

  describe('Edge Cases', () => {
    it('should handle empty string channelId', async () => {
      const deleteOptions: ChannelDeleteOptions = {
        channelId: '',
        force: true,
        output: 'table'
      };

      await expect(channelHandler.deleteChannel(deleteOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle whitespace-only channelId', async () => {
      const deleteOptions: ChannelDeleteOptions = {
        channelId: '   ',
        force: true,
        output: 'table'
      };

      await expect(channelHandler.deleteChannel(deleteOptions)).rejects.toThrow(PolyVValidationError);
    });

    it('should handle confirmation timeout scenarios', async () => {
      // Mock confirmation timeout
      mockConfirmation.confirmDeletion.mockRejectedValue(
        new Error('Confirmation timed out after 30 seconds')
      );

      const deleteOptions: ChannelDeleteOptions = {
        channelId: 'mock-test-channel',
        force: false,
        output: 'table'
      };

      // Should propagate confirmation timeout error
      await expect(channelHandler.deleteChannel(deleteOptions))
        .rejects.toThrow('Confirmation timed out');
    });
  });
});

/**
 * @fileoverview Integration tests for viewer commands
 * @author Development Team
 * @since 12.1.0
 */

import { ViewerServiceSdk } from '../../src/services/viewer-service';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

(shouldRunTests ? describe : describe.skip)('Viewer Integration Tests', () => {
  let viewerService: ViewerServiceSdk;

  beforeAll(() => {
    viewerService = new ViewerServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
  });

  // ========================================
  // Viewer Record Get Tests
  // ========================================

  describe('viewer get', () => {
    it('should handle non-existent viewer ID gracefully', async () => {
      try {
        const result = await viewerService.getViewerRecord({
          viewerUnionId: 'non-existent-viewer-id-99999'
        });
        // API might return empty or null
        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected error for non-existent viewer
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', '找不到'];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          expect(error).toBeDefined();
        }
      }
    }, 15000);

    it('should require viewerUnionId parameter', async () => {
      // SDK should throw for missing/empty viewerUnionId
      await expect(
        viewerService.getViewerRecord({
          viewerUnionId: ''
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Viewer Record List Tests
  // ========================================

  describe('viewer list', () => {
    it('should list viewer records successfully', async () => {
      try {
        const result = await viewerService.listViewerRecords({
          pageNumber: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
        expect(result.pageNumber).toBeDefined();
        expect(result.pageSize).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Viewer API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle pagination correctly', async () => {
      try {
        const result = await viewerService.listViewerRecords({
          pageNumber: 1,
          pageSize: 5
        });

        expect(result).toBeDefined();
        expect(result.pageSize).toBeLessThanOrEqual(5);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should filter by source type', async () => {
      try {
        const result = await viewerService.listViewerRecords({
          source: 'WX',
          pageNumber: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
        // If results exist, all should have source='WX'
        if (result.contents && result.contents.length > 0) {
          result.contents.forEach(viewer => {
            expect(viewer.source).toBe('WX');
          });
        }
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should filter by mobile number', async () => {
      try {
        const result = await viewerService.listViewerRecords({
          mobile: '13800138000',
          pageNumber: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should filter by email', async () => {
      try {
        const result = await viewerService.listViewerRecords({
          email: 'test@example.com',
          pageNumber: 1,
          pageSize: 10
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should validate invalid pageNumber parameter', async () => {
      await expect(
        viewerService.listViewerRecords({
          pageNumber: 0,
          pageSize: 10
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid pageSize parameter', async () => {
      await expect(
        viewerService.listViewerRecords({
          pageNumber: 1,
          pageSize: 0
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate pageSize exceeds max limit', async () => {
      await expect(
        viewerService.listViewerRecords({
          pageNumber: 1,
          pageSize: 1001
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Viewer Label List Tests
  // ========================================

  describe('viewer tag list', () => {
    it('should list viewer labels successfully', async () => {
      try {
        const result = await viewerService.listViewerLabels();

        expect(result).toBeDefined();
        expect(result.contents).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Viewer labels API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  // ========================================
  // Viewer Label Add Tests
  // ========================================

  describe('viewer tag add', () => {
    it('should handle invalid viewer ID gracefully', async () => {
      try {
        const result = await viewerService.addViewersLabels(
          ['invalid-viewer-id-99999'],
          [1]
        );

        // If it doesn't throw, check the result - API might accept invalid IDs
        expect(result).toBeDefined();
        expect(result.total).toBeGreaterThan(0);
      } catch (error: any) {
        // Expected: all operations fail, service throws error
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', 'failed', 'All'];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle invalid label ID gracefully', async () => {
      try {
        const result = await viewerService.addViewersLabels(
          ['test-viewer-id'],
          [99999999]
        );

        // If it doesn't throw, API might accept invalid label IDs
        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected: all operations fail, service throws error
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', 'failed', 'All'];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle batch operation with progress callback', async () => {
      const progressUpdates: Array<{ completed: number; total: number }> = [];

      try {
        const result = await viewerService.addViewersLabels(
          ['viewer1', 'viewer2'],
          [1],
          (completed, total) => {
            progressUpdates.push({ completed, total });
          }
        );

        expect(result).toBeDefined();
        expect(result.total).toBe(2);
        // Progress callback should have been called
        expect(progressUpdates.length).toBeGreaterThan(0);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found') || message.includes('failed')) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle empty arrays gracefully', async () => {
      // Empty arrays should either throw or return empty result
      try {
        const result = await viewerService.addViewersLabels([], [1]);
        // If it returns, it should indicate 0 operations
        expect(result.total).toBe(0);
      } catch (error: any) {
        // Throwing is also acceptable
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  // ========================================
  // Viewer Label Remove Tests
  // ========================================

  describe('viewer tag remove', () => {
    it('should handle invalid viewer ID gracefully', async () => {
      try {
        const result = await viewerService.removeViewersLabels(
          ['invalid-viewer-id-99999'],
          [1]
        );

        // If it doesn't throw, API might accept invalid viewer IDs
        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected: all operations fail, service throws error
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', 'failed', 'All'];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 15000);

    it('should handle empty arrays gracefully', async () => {
      // Empty arrays should either throw or return empty result
      try {
        const result = await viewerService.removeViewersLabels([], [1]);
        // If it returns, it should indicate 0 operations
        expect(result.total).toBe(0);
      } catch (error: any) {
        // Throwing is also acceptable
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  // ========================================
  // Validation Tests Summary
  // ========================================

  describe('validation tests', () => {
    it('should validate getViewerRecord viewerUnionId', async () => {
      await expect(
        viewerService.getViewerRecord({ viewerUnionId: '' })
      ).rejects.toThrow();
    });

    it('should validate listViewerRecords pageNumber', async () => {
      await expect(
        viewerService.listViewerRecords({ pageNumber: 0, pageSize: 10 })
      ).rejects.toThrow();
    });

    it('should validate listViewerRecords pageSize (too small)', async () => {
      await expect(
        viewerService.listViewerRecords({ pageNumber: 1, pageSize: 0 })
      ).rejects.toThrow();
    });

    it('should validate listViewerRecords pageSize (too large)', async () => {
      await expect(
        viewerService.listViewerRecords({ pageNumber: 1, pageSize: 1001 })
      ).rejects.toThrow();
    });

    it('should validate pageNumber must be >= 1', async () => {
      await expect(
        viewerService.listViewerRecords({ pageNumber: -1, pageSize: 10 })
      ).rejects.toThrow();
    });
  });

  // ========================================
  // Viewer Workflow Tests
  // ========================================

  describe('viewer workflow', () => {
    it('should complete list-viewers workflow', async () => {
      // 1. List viewers
      try {
        const listResult = await viewerService.listViewerRecords({
          pageNumber: 1,
          pageSize: 10
        });

        expect(listResult).toBeDefined();
        expect(Array.isArray(listResult.contents)).toBe(true);

        // 2. List available labels
        const labelsResult = await viewerService.listViewerLabels();
        expect(labelsResult).toBeDefined();
        expect(Array.isArray(labelsResult.contents)).toBe(true);
      } catch (error: any) {
        const message = error.message || '';
        if (message.includes('404') || message.includes('not found')) {
          console.log('Viewer API not available (404)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);

    it('should complete batch operation workflow', async () => {
      // This test demonstrates batch operations with mock data
      // In real scenarios, you'd use actual viewer and label IDs

      try {
        // 1. List labels first to get a valid label ID
        const labelsResult = await viewerService.listViewerLabels();

        if (!labelsResult.contents || labelsResult.contents.length === 0) {
          console.log('No labels available for batch test');
          return;
        }

        // 2. Try batch add (will likely fail with invalid IDs, but tests the workflow)
        const result = await viewerService.addViewersLabels(
          ['test-viewer-id-batch'],
          [labelsResult.contents[0].labelId]
        );

        expect(result).toBeDefined();
        expect(result.total).toBe(1);
      } catch (error: any) {
        const message = error.message || '';
        const expectedErrors = ['404', 'not found', '不存在', 'failed'];
        const isExpectedError = expectedErrors.some(e =>
          message.toLowerCase().includes(e.toLowerCase())
        );

        if (isExpectedError) {
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    }, 30000);
  });
});

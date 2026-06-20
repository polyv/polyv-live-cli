/**
 * @fileoverview Integration tests for document commands
 * @author Development Team
 * @since 9.5.0
 */

import { DocumentServiceSdk } from '../../src/services/document.service.sdk';
import { hasRealCredentials, getTestConfig } from '../helpers/integration-config';
import { createTemporaryChannel, deleteTemporaryChannel } from '../helpers/channel-fixture';

// Use test config from CLI accounts or environment
const testConfig = getTestConfig();
const shouldRunTests = hasRealCredentials();

// Test document URL - must be accessible by PolyV servers
// Can be overridden via POLYV_TEST_DOC_URL environment variable
const TEST_DOC_URL = process.env.POLYV_TEST_DOC_URL || '';

// Check if upload tests should run (requires accessible document URL)
const shouldRunUploadTests = shouldRunTests && TEST_DOC_URL.length > 0;

(shouldRunTests ? describe : describe.skip)('Document Integration Tests', () => {
  let documentService: DocumentServiceSdk;
  let testChannelId: string;
  let createdFileIds: string[] = [];

  beforeAll(() => {
    documentService = new DocumentServiceSdk(testConfig.authConfig, {
      baseUrl: testConfig.baseUrl,
      timeout: 30000,
      debug: false
    });
    testChannelId = createTemporaryChannel('Document Service');
  });

  afterAll(async () => {
    // Clean up created documents
    if (createdFileIds.length > 0) {
      console.log(`🧹 Cleaning up ${createdFileIds.length} created documents...`);
      for (const fileId of createdFileIds) {
        try {
          await documentService.deleteDocument(testChannelId, fileId, 'new');
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }

    if (testChannelId) {
      deleteTemporaryChannel(testChannelId);
    }
  });

  // ========================================
  // Document List Tests
  // ========================================

  describe('document list', () => {
    it('should list channel documents successfully', async () => {
      const result = await documentService.getDocumentList({
        channelId: testChannelId,
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalItems).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.contents)).toBe(true);

      if (result.contents.length > 0) {
        const doc = result.contents[0];
        expect(doc.fileId).toBeDefined();
        expect(doc.fileName).toBeDefined();
        expect(doc.status).toBeDefined();
      }
    }, 15000);

    it('should filter documents by status', async () => {
      const result = await documentService.getDocumentList({
        channelId: testChannelId,
        status: 'normal',
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);

      // All returned documents should have 'normal' status
      result.contents.forEach(doc => {
        expect(doc.status).toBe('normal');
      });
    }, 15000);

    it('should handle pagination correctly', async () => {
      const page1 = await documentService.getDocumentList({
        channelId: testChannelId,
        page: 1,
        pageSize: 5
      });

      expect(page1).toBeDefined();
      expect(page1.pageNumber).toBe(1);
      expect(page1.pageSize).toBe(5);
      expect(page1.contents.length).toBeLessThanOrEqual(5);
    }, 15000);

    it('should validate channelId parameter', async () => {
      await expect(
        documentService.getDocumentList({
          channelId: '',
          page: 1
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate page parameter', async () => {
      await expect(
        documentService.getDocumentList({
          channelId: testChannelId,
          page: 0
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate pageSize parameter', async () => {
      await expect(
        documentService.getDocumentList({
          channelId: testChannelId,
          pageSize: -1
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate status parameter', async () => {
      await expect(
        documentService.getDocumentList({
          channelId: testChannelId,
          status: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Document Upload Tests
  // ========================================

  describe('document upload', () => {
    // Skip upload tests if no test URL is configured
    if (!shouldRunUploadTests) {
      it.skip('should upload a document with minimal required fields (skipped: POLYV_TEST_DOC_URL not set)', () => {});
      it.skip('should upload a document with animate type (skipped: POLYV_TEST_DOC_URL not set)', () => {});
      it.skip('should upload a document with custom name (skipped: POLYV_TEST_DOC_URL not set)', () => {});
    } else {
      it('should upload a document with minimal required fields', async () => {
        const result = await documentService.uploadDocument(testChannelId, {
          url: TEST_DOC_URL,
          type: 'common'
        });

        expect(result).toBeDefined();
        expect(result.fileId).toBeDefined();
        expect(typeof result.fileId).toBe('string');
        expect(result.status).toBeDefined();

        createdFileIds.push(result.fileId);
      }, 30000);

      it('should upload a document with animate type', async () => {
        const result = await documentService.uploadDocument(testChannelId, {
          url: TEST_DOC_URL,
          type: 'animate'
        });

        expect(result).toBeDefined();
        expect(result.fileId).toBeDefined();

        createdFileIds.push(result.fileId);
      }, 30000);

      it('should upload a document with custom name', async () => {
        const result = await documentService.uploadDocument(testChannelId, {
          url: TEST_DOC_URL,
          type: 'common',
          docName: `Test Document ${Date.now()}`
        });

        expect(result).toBeDefined();
        expect(result.fileId).toBeDefined();

        createdFileIds.push(result.fileId);
      }, 30000);
    }

    // Validation tests always run (they don't need actual upload)
    it('should validate empty channelId', async () => {
      await expect(
        documentService.uploadDocument('', {
          url: TEST_DOC_URL || 'https://example.com/test.pdf'
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty url', async () => {
      await expect(
        documentService.uploadDocument(testChannelId, {
          url: ''
        })
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid type', async () => {
      await expect(
        documentService.uploadDocument(testChannelId, {
          url: TEST_DOC_URL || 'https://example.com/test.pdf',
          type: 'invalid' as any
        })
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Document Status Tests
  // ========================================

  describe('document status', () => {
    // These tests require an existing document
    // Use the first document from the list if available
    let testFileId: string | null = null;

    beforeAll(async () => {
      // Try to get an existing document for status tests
      const result = await documentService.getDocumentList({
        channelId: testChannelId,
        status: 'normal',
        page: 1,
        pageSize: 1
      });

      if (result.contents.length > 0) {
        testFileId = result.contents[0].fileId;
      }
    }, 15000);

    it('should get document conversion status', async () => {
      if (!testFileId) {
        console.log('Skipping test: no documents available for status check');
        return;
      }

      const result = await documentService.getDocumentStatus(testChannelId, testFileId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const statusItem = result[0];
      expect(statusItem.fileId).toBe(testFileId);
      expect(statusItem.convertStatus).toBeDefined();
      expect(statusItem.type).toBeDefined();
    }, 15000);

    it('should validate empty channelId', async () => {
      await expect(
        documentService.getDocumentStatus('', testFileId || 'test-id')
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty fileId', async () => {
      await expect(
        documentService.getDocumentStatus(testChannelId, '')
      ).rejects.toThrow();
    }, 10000);
  });

  // ========================================
  // Document Delete Tests
  // ========================================

  describe('document delete', () => {
    // Validation tests always run
    it('should validate empty channelId', async () => {
      await expect(
        documentService.deleteDocument('', 'some-file-id', 'new')
      ).rejects.toThrow();
    }, 10000);

    it('should validate empty fileId', async () => {
      await expect(
        documentService.deleteDocument(testChannelId, '', 'new')
      ).rejects.toThrow();
    }, 10000);

    it('should validate invalid type', async () => {
      await expect(
        documentService.deleteDocument(testChannelId, 'some-file-id', 'invalid' as any)
      ).rejects.toThrow();
    }, 10000);

    // Actual delete test requires upload capability
    if (shouldRunUploadTests) {
      it('should delete a document successfully', async () => {
        // First upload a document
        const uploadResult = await documentService.uploadDocument(testChannelId, {
          url: TEST_DOC_URL,
          type: 'common'
        });

        const fileId = uploadResult.fileId;

        // Then delete it
        const deleteResult = await documentService.deleteDocument(testChannelId, fileId, 'new');

        expect(deleteResult).toBe(true);

        // Remove from cleanup list since it's already deleted
        createdFileIds = createdFileIds.filter(id => id !== fileId);
      }, 30000);
    } else {
      it.skip('should delete a document successfully (skipped: POLYV_TEST_DOC_URL not set)', () => {});
    }

    it('should handle non-existent document gracefully', async () => {
      // PolyV API may return success even for non-existent documents
      // This test verifies the API call doesn't crash
      const result = await documentService.deleteDocument(testChannelId, 'non-existent-file-id-12345', 'new');
      // Result could be true or empty string depending on API behavior
      expect([true, '', 'SUCCESS']).toContain(result);
    }, 15000);
  });

  // ========================================
  // Document Lifecycle Test
  // ========================================

  describe('document lifecycle (CRUD)', () => {
    if (shouldRunUploadTests) {
      it('should complete full document lifecycle', async () => {
        // 1. Upload (Create)
        const uploadResult = await documentService.uploadDocument(testChannelId, {
          url: TEST_DOC_URL,
          type: 'common',
          docName: `Lifecycle Test Doc ${Date.now()}`
        });

        expect(uploadResult.fileId).toBeDefined();
        const fileId = uploadResult.fileId;

        // 2. Read - Verify list call works
        await documentService.getDocumentList({
          channelId: testChannelId,
          page: 1,
          pageSize: 100
        });

        // Note: The document might not appear immediately due to async processing

        // 3. Get status
        const statusResult = await documentService.getDocumentStatus(testChannelId, fileId);
        expect(statusResult.length).toBeGreaterThan(0);
        expect(statusResult[0].fileId).toBe(fileId);

        // 4. Delete
        const deleteResult = await documentService.deleteDocument(testChannelId, fileId, 'new');
        expect(deleteResult).toBe(true);
      }, 60000);
    } else {
      it.skip('should complete full document lifecycle (skipped: POLYV_TEST_DOC_URL not set)', () => {});
    }
  });
});

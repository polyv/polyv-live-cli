/**
 * @fileoverview Tests for pagination utilities
 */
import { describe, it, expect } from 'vitest';
import { paginate, collectAll } from './pagination.js';
import type { PaginationOptions, PaginationResponse } from '../types/pagination.js';

describe('pagination', () => {
  describe('paginate', () => {
    it('should yield items from single page', async () => {
      const fetcher = async (): Promise<PaginationResponse<string>> => ({
        items: ['a', 'b', 'c'],
        total: 3,
        page: 1,
        pageSize: 3,
        hasMore: false,
      });

      const pages: string[][] = [];
      for await (const items of paginate(fetcher)) {
        pages.push(items);
      }

      expect(pages).toHaveLength(1);
      expect(pages[0]).toEqual(['a', 'b', 'c']);
    });

    it('should yield items from multiple pages', async () => {
      let callCount = 0;
      const fetcher = async (_opts: PaginationOptions): Promise<PaginationResponse<number>> => {
        callCount++;
        if (callCount === 1) {
          return { items: [1, 2], total: 4, page: 1, pageSize: 2, hasMore: true };
        }
        return { items: [3, 4], total: 4, page: 2, pageSize: 2, hasMore: false };
      };

      const pages: number[][] = [];
      for await (const items of paginate(fetcher)) {
        pages.push(items);
      }

      expect(pages).toHaveLength(2);
      expect(pages[0]).toEqual([1, 2]);
      expect(pages[1]).toEqual([3, 4]);
    });

    it('should calculate hasMore from total when not provided', async () => {
      const fetcher = async (opts: PaginationOptions): Promise<PaginationResponse<number>> => {
        const page = opts.page || 1;
        const pageSize = opts.pageSize || 100;

        // Return 10 items total, 5 per page
        const start = (page - 1) * pageSize;
        const items = Array.from({ length: 5 }, (_, i) => start + i + 1);

        return { items, total: 10, page, pageSize, hasMore: undefined as unknown as boolean };
      };

      const pages: number[][] = [];
      for await (const items of paginate(fetcher, { pageSize: 5 })) {
        pages.push(items);
      }

      expect(pages).toHaveLength(2);
    });

    it('should use custom pageSize', async () => {
      const fetcher = async (opts: PaginationOptions): Promise<PaginationResponse<string>> => {
        expect(opts.pageSize).toBe(10);
        return { items: ['a'], total: 1, page: 1, pageSize: 10, hasMore: false };
      };

      for await (const _ of paginate(fetcher, { pageSize: 10 })) {
        // Just check pageSize was passed
      }
    });

    it('should handle empty result', async () => {
      const fetcher = async (): Promise<PaginationResponse<string>> => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      });

      const pages: string[][] = [];
      for await (const items of paginate(fetcher)) {
        pages.push(items);
      }

      expect(pages).toHaveLength(1);
      expect(pages[0]).toEqual([]);
    });
  });

  describe('collectAll', () => {
    it('should collect all items into single array', async () => {
      let callCount = 0;
      const fetcher = async (): Promise<PaginationResponse<number>> => {
        callCount++;
        if (callCount === 1) {
          return { items: [1, 2, 3], total: 6, page: 1, pageSize: 3, hasMore: true };
        }
        if (callCount === 2) {
          return { items: [4, 5], total: 6, page: 2, pageSize: 3, hasMore: true };
        }
        return { items: [6], total: 6, page: 3, pageSize: 3, hasMore: false };
      };

      const allItems = await collectAll(fetcher);
      expect(allItems).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should handle empty result', async () => {
      const fetcher = async (): Promise<PaginationResponse<string>> => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      });

      const allItems = await collectAll(fetcher);
      expect(allItems).toEqual([]);
    });

    it('should pass pageSize option', async () => {
      const fetcher = async (opts: PaginationOptions): Promise<PaginationResponse<number>> => {
        expect(opts.pageSize).toBe(50);
        return { items: [1], total: 1, page: 1, pageSize: 50, hasMore: false };
      };

      await collectAll(fetcher, { pageSize: 50 });
    });
  });
});

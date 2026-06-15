/**
 * @fileoverview Unit tests for SearchPanel component (Optimized for Performance)
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { SearchPanel, SearchConfig, FilterCriteria } from './search-panel';

// Mock blessed module
jest.mock('blessed', () => ({
  textbox: jest.fn(),
  box: jest.fn(),
}));

describe('SearchPanel', () => {
  let searchPanel: SearchPanel;
  let mockScreen: any;
  let mockEventBus: EventEmitter;
  let mockSearchBox: any;
  let mockResultsBox: any;
  let mockStatusBox: any;

  const createMockWidget = () => ({
    focus: jest.fn(),
    getValue: jest.fn().mockReturnValue(''),
    clearValue: jest.fn(),
    setContent: jest.fn(),
    on: jest.fn(),
    key: jest.fn(),
    destroy: jest.fn(),
  });

  const sampleData = [
    { id: 'ch001', name: 'Live Stream 1', status: 'live', type: 'channel' },
    { id: 'ch002', name: 'Live Stream 2', status: 'offline', type: 'channel' },
    { id: 'ch003', name: 'Test Channel', status: 'live', type: 'channel' },
    { id: 'sys001', name: 'System Monitor', status: 'active', type: 'system' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // 使用假定时器以提高性能

    mockSearchBox = createMockWidget();
    mockResultsBox = createMockWidget();
    mockStatusBox = createMockWidget();

    mockScreen = {
      width: 80,
      height: 24,
      append: jest.fn(),
      remove: jest.fn(),
      render: jest.fn(),
    };

    mockEventBus = new EventEmitter();

    // Mock blessed components
    const blessed = require('blessed');
    blessed.textbox.mockReturnValue(mockSearchBox);
    blessed.box.mockImplementation((options: any) => {
      if (options.label === ' Results ') {
        return mockResultsBox;
      } else if (options.content) {
        return mockStatusBox;
      }
      return mockResultsBox;
    });

    const config: SearchConfig = {
      placeholder: 'Search channels...',
      caseSensitive: false,
      mode: 'fuzzy',
      searchFields: ['name', 'id', 'status'],
      maxHistory: 5,
      showSuggestions: true,
      minChars: 1,
      debounceDelay: 100,
    };

    searchPanel = new SearchPanel(mockScreen, mockEventBus, config);
    searchPanel.setDataSource(sampleData);
  });

  afterEach(() => {
    searchPanel.destroy();
    jest.useRealTimers(); // 恢复真实定时器
  });

  describe('Constructor', () => {
    it('should initialize search panel', () => {
      expect(searchPanel).toBeInstanceOf(SearchPanel);
      expect(searchPanel.isSearchVisible()).toBe(false);
    });
  });

  describe('Visibility and State Management', () => {
    it('should handle show when already visible', () => {
      searchPanel.show();
      expect(searchPanel.isSearchVisible()).toBe(true);
      
      // Show again should hide first
      const hideSpy = jest.spyOn(searchPanel, 'hide');
      searchPanel.show();
      expect(hideSpy).toHaveBeenCalled();
    });

    it('should handle hide when not visible', () => {
      expect(searchPanel.isSearchVisible()).toBe(false);
      
      // Should not throw error
      expect(() => searchPanel.hide()).not.toThrow();
    });

    it('should handle show when components creation fails', () => {
      // Mock blessed to return null
      const blessed = require('blessed');
      blessed.textbox.mockReturnValue(null);
      
      searchPanel.show();
      expect(searchPanel.isSearchVisible()).toBe(false);
    });

    it('should handle hide with error during cleanup', () => {
      searchPanel.show();
      
      // Mock screen.remove to throw error
      mockScreen.remove.mockImplementationOnce(() => {
        throw new Error('Cleanup failed');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      searchPanel.hide();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to hide search panel:', expect.any(Error));
      expect(searchPanel.isSearchVisible()).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should clear search timeout on hide', () => {
      searchPanel.show();
      
      // Trigger search to create timeout
      searchPanel['handleSearchInput']('test');
      expect(searchPanel['searchTimeout']).toBeDefined();
      
      searchPanel.hide();
      expect(searchPanel['searchTimeout']).toBeUndefined();
    });
  });

  describe('Data Source and Filtering', () => {
    it('should trigger search when setting data source with existing query', () => {
      searchPanel.show();
      searchPanel['currentQuery'] = 'test';
      
      const performSearchSpy = jest.spyOn(searchPanel, 'performSearch' as any);
      searchPanel.setDataSource(sampleData);
      
      expect(performSearchSpy).toHaveBeenCalledWith('test');
    });

    it('should trigger search when setting filter criteria with existing query', () => {
      searchPanel.show();
      searchPanel['currentQuery'] = 'test';
      
      const performSearchSpy = jest.spyOn(searchPanel, 'performSearch' as any);
      const filterCriteria: FilterCriteria = {
        status: ['live'],
        type: ['channel'],
      };
      
      searchPanel.setFilterCriteria(filterCriteria);
      
      expect(performSearchSpy).toHaveBeenCalledWith('test');
    });

    it('should not trigger search when no current query exists', () => {
      const performSearchSpy = jest.spyOn(searchPanel, 'performSearch' as any);
      searchPanel.setDataSource(sampleData);
      
      expect(performSearchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Search Result Management', () => {
    it('should return null when no results available', () => {
      searchPanel['currentResults'] = [];
      searchPanel['selectedIndex'] = 0;
      
      expect(searchPanel.getSelectedResult()).toBeNull();
    });

    it('should return null when selected index is out of bounds', () => {
      searchPanel['currentResults'] = [
        { item: sampleData[0], score: 1, matches: [], index: 0 },
      ];
      searchPanel['selectedIndex'] = 2;
      
      expect(searchPanel.getSelectedResult()).toBeNull();
    });

    it('should return null when selected index is negative', () => {
      searchPanel['currentResults'] = [
        { item: sampleData[0], score: 1, matches: [], index: 0 },
      ];
      searchPanel['selectedIndex'] = -1;
      
      expect(searchPanel.getSelectedResult()).toBeNull();
    });

    it('should handle navigation with empty results', () => {
      searchPanel['currentResults'] = [];
      const originalIndex = searchPanel['selectedIndex'];
      
      searchPanel.navigateUp();
      expect(searchPanel['selectedIndex']).toBe(originalIndex);
      
      searchPanel.navigateDown();
      expect(searchPanel['selectedIndex']).toBe(originalIndex);
    });

    it('should handle selection when no result is selected', () => {
      searchPanel['currentResults'] = [];
      
      const emitSpy = jest.spyOn(searchPanel['eventBus'], 'emit');
      searchPanel.selectResult();
      
      expect(emitSpy).not.toHaveBeenCalledWith('search:result:selected', expect.any(Object));
    });
  });

  describe('Search Mode Handling', () => {
    it('should handle fuzzy search mode', () => {
      searchPanel.show();
      searchPanel['config'].mode = 'fuzzy';
      
      const fuzzySearchSpy = jest.spyOn(searchPanel, 'fuzzySearch' as any);
      searchPanel['performSearch']('test');
      
      expect(fuzzySearchSpy).toHaveBeenCalledWith('test', sampleData);
    });

    it('should handle contains search mode', () => {
      searchPanel.show();
      searchPanel['config'].mode = 'contains';
      
      const containsSearchSpy = jest.spyOn(searchPanel, 'containsSearch' as any);
      searchPanel['performSearch']('test');
      
      expect(containsSearchSpy).toHaveBeenCalledWith('test', sampleData);
    });

    it('should handle exact search mode', () => {
      searchPanel.show();
      searchPanel['config'].mode = 'exact';
      
      const exactSearchSpy = jest.spyOn(searchPanel, 'exactSearch' as any);
      searchPanel['performSearch']('test');
      
      expect(exactSearchSpy).toHaveBeenCalledWith('test', sampleData);
    });

    it('should default to exact search for unknown mode', () => {
      searchPanel.show();
      searchPanel['config'].mode = 'unknown' as any;
      
      const exactSearchSpy = jest.spyOn(searchPanel, 'exactSearch' as any);
      searchPanel['performSearch']('test');
      
      expect(exactSearchSpy).toHaveBeenCalledWith('test', sampleData);
    });
  });

  describe('Error Handling', () => {
    it('should handle search errors gracefully', () => {
      searchPanel.show();
      
      // Mock applyFilters to throw error
      jest.spyOn(searchPanel, 'applyFilters' as any).mockImplementation(() => {
        throw new Error('Filter failed');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      searchPanel['performSearch']('test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Search failed:', expect.any(Error));
      expect(searchPanel['currentResults']).toEqual([]);
      
      consoleSpy.mockRestore();
    });

    it('should handle minimum characters requirement', () => {
      searchPanel.show();
      searchPanel['config'].minChars = 3;
      
      const updateDisplaySpy = jest.spyOn(searchPanel, 'updateResultsDisplay' as any);
      
      searchPanel['performSearch']('te');
      
      expect(searchPanel['currentResults']).toEqual([]);
      expect(updateDisplaySpy).toHaveBeenCalled();
    });

    it('should handle empty query', () => {
      searchPanel.show();
      
      const updateDisplaySpy = jest.spyOn(searchPanel, 'updateResultsDisplay' as any);
      
      searchPanel['performSearch']('');
      
      expect(searchPanel['currentResults']).toEqual([]);
      expect(updateDisplaySpy).toHaveBeenCalled();
    });
  });

  describe('Core Functionality', () => {
    beforeEach(() => {
      searchPanel.show();
    });

    it('should perform basic search', () => {
      searchPanel['handleSearchInput']('live');
      jest.advanceTimersByTime(150);
      
      const results = searchPanel.getResults();
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle empty search', () => {
      searchPanel['handleSearchInput']('');
      jest.advanceTimersByTime(150);
      
      expect(searchPanel.getResults()).toHaveLength(0);
    });

    it('should navigate through results', () => {
      searchPanel['currentResults'] = [
        { item: { id: '1' }, score: 1, matches: [], index: 0 },
        { item: { id: '2' }, score: 0.8, matches: [], index: 1 },
      ];

      expect(searchPanel['selectedIndex']).toBe(0);
      searchPanel.navigateDown();
      expect(searchPanel['selectedIndex']).toBe(1);
      searchPanel.navigateUp();
      expect(searchPanel['selectedIndex']).toBe(0);
    });

    it('should apply filters', () => {
      const criteria: FilterCriteria = { status: ['live'] };
      searchPanel.setFilterCriteria(criteria);
      searchPanel['performSearch']('');
      
      const results = searchPanel.getResults();
      results.forEach(result => {
        expect(result.item.status).toBe('live');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data source', () => {
      searchPanel.setDataSource(null as any);
      expect(() => searchPanel['performSearch']('test')).not.toThrow();
      expect(searchPanel.getResults()).toHaveLength(0);
    });

    it('should handle creation errors', () => {
      const blessed = require('blessed');
      blessed.textbox.mockImplementation(() => {
        throw new Error('Creation failed');
      });

      expect(() => searchPanel.show()).not.toThrow();
      expect(searchPanel.isSearchVisible()).toBe(false);
    });

    it('should handle undefined field values', () => {
      const dataWithUndefined = [
        { id: '1', name: undefined, status: 'active' },
        { id: '2', name: null, status: 'inactive' },
      ];

      searchPanel.setDataSource(dataWithUndefined);
      expect(() => searchPanel['performSearch']('test')).not.toThrow();
    });

    it('should handle moderate datasets', () => {
      const data = Array(20).fill(0).map((_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        status: 'active',
      }));

      searchPanel.setDataSource(data);
      expect(() => searchPanel['performSearch']('Item')).not.toThrow();
    });

    it('should handle special characters', () => {
      const specialQuery = '!@#$%^&*()';
      expect(() => searchPanel['performSearch'](specialQuery)).not.toThrow();
    });

    it('should handle display updates with null elements', () => {
      searchPanel['resultsBox'] = null;
      searchPanel['statusBox'] = null;
      
      expect(() => {
        searchPanel['updateResultsDisplay']();
        searchPanel['updateStatusDisplay']();
      }).not.toThrow();
    });

    it('should handle timeout cleanup', () => {
      searchPanel['searchTimeout'] = setTimeout(() => {}, 100);
      expect(() => searchPanel.destroy()).not.toThrow();
    });
  });

  describe('History Management', () => {
    it('should manage search history', () => {
      searchPanel['addToHistory']('test1');
      searchPanel['addToHistory']('test2');
      
      const history = searchPanel.getSearchHistory();
      expect(history).toContain('test1');
      expect(history).toContain('test2');
    });

    it('should limit history size', () => {
      for (let i = 0; i < 10; i++) {
        searchPanel['addToHistory'](`query${i}`);
      }
      
      const history = searchPanel.getSearchHistory();
      expect(history.length).toBeLessThanOrEqual(5);
    });

    it('should clear history', () => {
      searchPanel['addToHistory']('test');
      searchPanel.clearHistory();
      
      expect(searchPanel.getSearchHistory()).toHaveLength(0);
    });
  });

  describe('Event Emission', () => {
    it('should emit search events', () => {
      const eventSpy = jest.spyOn(mockEventBus, 'emit');
      
      searchPanel.show();
      searchPanel['handleSearchInput']('test');
      jest.advanceTimersByTime(150);
      
      expect(eventSpy).toHaveBeenCalledWith('search:results:updated', expect.any(Object));
    });

    it('should clear search without errors', () => {
      // Just verify clearSearch doesn't throw
      expect(() => searchPanel.clearSearch()).not.toThrow();
      expect(searchPanel.getResults()).toHaveLength(0);
    });
  });

  describe('Cleanup', () => {
    it('should destroy cleanly', () => {
      searchPanel.show();
      
      // Just verify destroy doesn't throw error
      expect(() => searchPanel.destroy()).not.toThrow();
    });

    it('should handle multiple destroys', () => {
      expect(() => {
        searchPanel.destroy();
        searchPanel.destroy();
      }).not.toThrow();
    });
  });
});
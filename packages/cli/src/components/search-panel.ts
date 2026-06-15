/**
 * @fileoverview Search panel component for real-time search and filtering
 * @author Development Team
 * @since 1.0.0
 */

import blessed from 'blessed';
import { EventEmitter } from 'events';

/**
 * Search configuration interface
 */
export interface SearchConfig {
  /** Placeholder text for search input */
  placeholder?: string;
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Search mode: fuzzy, exact, or contains */
  mode?: 'fuzzy' | 'exact' | 'contains';
  /** Fields to search in */
  searchFields?: string[];
  /** Maximum search history items */
  maxHistory?: number;
  /** Show search suggestions */
  showSuggestions?: boolean;
  /** Minimum characters to trigger search */
  minChars?: number;
  /** Search debounce delay in ms */
  debounceDelay?: number;
}

/**
 * Search result interface
 */
export interface SearchResult {
  /** Matched item data */
  item: any;
  /** Match score (0-1, higher is better) */
  score: number;
  /** Matched fields with highlights */
  matches: SearchMatch[];
  /** Original index in dataset */
  index: number;
}

/**
 * Search match interface
 */
export interface SearchMatch {
  /** Field name that matched */
  field: string;
  /** Original value */
  value: string;
  /** Highlighted value with markers */
  highlighted: string;
  /** Match positions */
  positions: number[];
  /** Match score for this field */
  score: number;
}

/**
 * Filter criteria interface
 */
export interface FilterCriteria {
  /** Filter by status */
  status?: string[];
  /** Filter by type */
  type?: string[];
  /** Filter by date range */
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  /** Custom filter function */
  custom?: (item: any) => boolean;
}

/**
 * Search panel component for real-time search and filtering
 */
export class SearchPanel {
  private screen: any;
  private eventBus: EventEmitter;
  private config: SearchConfig;
  private searchBox: any;
  private resultsBox: any;
  private statusBox: any;
  private isVisible = false;
  private searchHistory: string[] = [];
  private currentQuery = '';
  private currentResults: SearchResult[] = [];
  private selectedIndex = 0;
  private searchTimeout: NodeJS.Timeout | undefined;
  private dataSource: any[] = [];
  private filterCriteria: FilterCriteria = {};

  constructor(screen: any, eventBus: EventEmitter, config: SearchConfig = {}) {
    this.screen = screen;
    this.eventBus = eventBus;
    this.config = {
      placeholder: 'Search...',
      caseSensitive: false,
      mode: 'fuzzy',
      searchFields: ['name', 'id', 'status'],
      maxHistory: 10,
      showSuggestions: true,
      minChars: 1,
      debounceDelay: 300,
      ...config,
    };
  }

  /**
   * Show the search panel
   */
  public show(): void {
    if (this.isVisible) {
      this.hide();
    }

    this.createSearchInterface();
    
    // Only set visible and emit event if creation succeeded
    if (this.searchBox && this.resultsBox && this.statusBox) {
      this.isVisible = true;
      
      this.eventBus.emit('search:shown', {
        timestamp: new Date(),
      });
    }
  }

  /**
   * Hide the search panel
   */
  public hide(): void {
    if (!this.isVisible) return;

    try {
      if (this.searchBox) {
        this.screen.remove(this.searchBox);
        this.searchBox = null;
      }
      if (this.resultsBox) {
        this.screen.remove(this.resultsBox);
        this.resultsBox = null;
      }
      if (this.statusBox) {
        this.screen.remove(this.statusBox);
        this.statusBox = null;
      }

      this.isVisible = false;
      this.currentQuery = '';
      this.currentResults = [];
      this.selectedIndex = 0;

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = undefined;
      }

      this.screen.render();

      this.eventBus.emit('search:hidden', {
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to hide search panel:', error);
      this.isVisible = false;
    }
  }

  /**
   * Set data source for searching
   */
  public setDataSource(data: any[]): void {
    this.dataSource = data;
    if (this.currentQuery) {
      this.performSearch(this.currentQuery);
    }
  }

  /**
   * Set filter criteria
   */
  public setFilterCriteria(criteria: FilterCriteria): void {
    this.filterCriteria = criteria;
    if (this.currentQuery) {
      this.performSearch(this.currentQuery);
    }
  }

  /**
   * Get current search results
   */
  public getResults(): SearchResult[] {
    return this.currentResults;
  }

  /**
   * Get selected result
   */
  public getSelectedResult(): SearchResult | null {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.currentResults.length) {
      return this.currentResults[this.selectedIndex] || null;
    }
    return null;
  }

  /**
   * Check if search panel is visible
   */
  public isSearchVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Clear current search
   */
  public clearSearch(): void {
    this.currentQuery = '';
    this.currentResults = [];
    this.selectedIndex = 0;
    
    if (this.searchBox) {
      this.searchBox.clearValue();
    }
    
    this.updateResultsDisplay();
    this.updateStatusDisplay();
  }

  /**
   * Navigate selection up
   */
  public navigateUp(): void {
    if (this.currentResults.length === 0) return;
    
    this.selectedIndex = this.selectedIndex === 0 
      ? this.currentResults.length - 1 
      : this.selectedIndex - 1;
    
    this.updateResultsDisplay();
  }

  /**
   * Navigate selection down
   */
  public navigateDown(): void {
    if (this.currentResults.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
    this.updateResultsDisplay();
  }

  /**
   * Select current result
   */
  public selectResult(): void {
    const selected = this.getSelectedResult();
    if (selected) {
      this.eventBus.emit('search:result:selected', {
        result: selected,
        query: this.currentQuery,
        timestamp: new Date(),
      });
      
      // Add to history if not already present
      this.addToHistory(this.currentQuery);
    }
  }

  /**
   * Create search interface components
   */
  private createSearchInterface(): void {
    try {
      const screenWidth = this.screen.width || 80;
      const screenHeight = this.screen.height || 24;

      // Search input box
      this.searchBox = blessed.textbox({
        top: 2,
        left: 'center',
        width: Math.min(60, screenWidth - 4),
        height: 3,
        label: ' Search ',
        border: {
          type: 'line',
        },
        style: {
          fg: 'white',
          bg: 'black',
          border: {
            fg: 'cyan',
          },
          focus: {
            border: {
              fg: 'yellow',
            },
          },
        },
        inputOnFocus: true,
        keys: true,
        mouse: true,
      });

      // Results display box
      this.resultsBox = blessed.box({
        top: 6,
        left: 'center',
        width: Math.min(60, screenWidth - 4),
        height: Math.min(15, screenHeight - 12),
        label: ' Results ',
        border: {
          type: 'line',
        },
        style: {
          fg: 'white',
          bg: 'black',
          border: {
            fg: 'gray',
          },
        },
        scrollable: true,
        alwaysScroll: true,
        keys: true,
        mouse: true,
        tags: true,
      });

      // Status display box
      this.statusBox = blessed.box({
        top: screenHeight - 3,
        left: 'center',
        width: Math.min(60, screenWidth - 4),
        height: 3,
        content: 'Press Ctrl+F to search, Esc to close',
        border: {
          type: 'line',
        },
        style: {
          fg: 'gray',
          bg: 'black',
          border: {
            fg: 'gray',
          },
        },
        tags: true,
      });

      // Set up event handlers
      this.setupSearchEvents();

      // Add to screen
      this.screen.append(this.searchBox);
      this.screen.append(this.resultsBox);
      this.screen.append(this.statusBox);

      // Focus search box
      this.searchBox.focus();
      this.screen.render();

    } catch (error) {
      console.error('Failed to create search interface:', error);
      this.isVisible = false;
      this.searchBox = null;
      this.resultsBox = null;
      this.statusBox = null;
    }
  }

  /**
   * Set up search event handlers
   */
  private setupSearchEvents(): void {
    if (!this.searchBox || !this.resultsBox) return;

    // Handle search input
    this.searchBox.on('submit', () => {
      this.selectResult();
    });

    this.searchBox.key(['escape'], () => {
      this.hide();
    });

    this.searchBox.key(['up'], () => {
      this.navigateUp();
    });

    this.searchBox.key(['down'], () => {
      this.navigateDown();
    });

    this.searchBox.key(['enter'], () => {
      this.selectResult();
    });

    // Handle real-time search
    this.searchBox.on('keypress', (_ch: any, key: any) => {
      if (key && (key.name === 'escape' || key.name === 'enter' || 
                  key.name === 'up' || key.name === 'down')) {
        return; // These are handled separately
      }

      // Get current input value
      setTimeout(() => {
        const query = this.searchBox.getValue();
        if (query !== this.currentQuery) {
          this.handleSearchInput(query);
        }
      }, 10);
    });

    // Handle results box events
    this.resultsBox.key(['escape'], () => {
      this.hide();
    });

    this.resultsBox.key(['enter'], () => {
      this.selectResult();
    });

    this.resultsBox.on('click', () => {
      // Handle result selection by mouse
      this.selectResult();
    });
  }

  /**
   * Handle search input with debouncing
   */
  private handleSearchInput(query: string): void {
    this.currentQuery = query;

    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce search
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, this.config.debounceDelay);
  }

  /**
   * Perform search operation
   */
  private performSearch(query: string): void {
    try {
      if (!query || query.length < (this.config.minChars || 1)) {
        this.currentResults = [];
        this.selectedIndex = 0;
        this.updateResultsDisplay();
        this.updateStatusDisplay();
        return;
      }

      // Apply filters first
      const filteredData = this.applyFilters(this.dataSource);

      // Perform search
      let results: SearchResult[];
      switch (this.config.mode) {
        case 'fuzzy':
          results = this.fuzzySearch(query, filteredData);
          break;
        case 'contains':
          results = this.containsSearch(query, filteredData);
          break;
        case 'exact':
        default:
          results = this.exactSearch(query, filteredData);
          break;
      }

      this.currentResults = results;
      this.selectedIndex = 0;

      this.updateResultsDisplay();
      this.updateStatusDisplay();

      this.eventBus.emit('search:results:updated', {
        query,
        results: this.currentResults,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Search failed:', error);
      this.currentResults = [];
      this.updateResultsDisplay();
      this.updateStatusDisplay();
    }
  }

  /**
   * Apply filter criteria to data
   */
  private applyFilters(data: any[]): any[] {
    return data.filter(item => {
      // Status filter
      if (this.filterCriteria.status && this.filterCriteria.status.length > 0) {
        if (!this.filterCriteria.status.includes(item.status)) {
          return false;
        }
      }

      // Type filter
      if (this.filterCriteria.type && this.filterCriteria.type.length > 0) {
        if (!this.filterCriteria.type.includes(item.type)) {
          return false;
        }
      }

      // Date range filter
      if (this.filterCriteria.dateRange) {
        const itemDate = new Date(item.createdAt || item.updatedAt || Date.now());
        if (this.filterCriteria.dateRange.start && itemDate < this.filterCriteria.dateRange.start) {
          return false;
        }
        if (this.filterCriteria.dateRange.end && itemDate > this.filterCriteria.dateRange.end) {
          return false;
        }
      }

      // Custom filter
      if (this.filterCriteria.custom && !this.filterCriteria.custom(item)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Perform fuzzy search
   */
  private fuzzySearch(query: string, data: any[]): SearchResult[] {
    const searchQuery = this.config.caseSensitive ? query : query.toLowerCase();
    const results: SearchResult[] = [];

    data.forEach((item, index) => {
      const matches: SearchMatch[] = [];
      let totalScore = 0;

      for (const field of this.config.searchFields || []) {
        const fieldValue = this.getFieldValue(item, field);
        if (!fieldValue) continue;

        const searchValue = this.config.caseSensitive ? fieldValue : fieldValue.toLowerCase();
        const match = this.calculateFuzzyMatch(searchQuery, searchValue, field);
        
        if (match.score > 0) {
          matches.push(match);
          totalScore += match.score;
        }
      }

      if (matches.length > 0) {
        results.push({
          item,
          score: totalScore / matches.length,
          matches,
          index,
        });
      }
    });

    // Sort by score (descending)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Perform exact search
   */
  private exactSearch(query: string, data: any[]): SearchResult[] {
    const searchQuery = this.config.caseSensitive ? query : query.toLowerCase();
    const results: SearchResult[] = [];

    data.forEach((item, index) => {
      const matches: SearchMatch[] = [];

      for (const field of this.config.searchFields || []) {
        const fieldValue = this.getFieldValue(item, field);
        if (!fieldValue) continue;

        const searchValue = this.config.caseSensitive ? fieldValue : fieldValue.toLowerCase();
        
        if (searchValue.includes(searchQuery)) {
          const match = this.calculateExactMatch(searchQuery, searchValue, fieldValue, field);
          matches.push(match);
        }
      }

      if (matches.length > 0) {
        results.push({
          item,
          score: 1.0, // Exact matches have perfect score
          matches,
          index,
        });
      }
    });

    return results;
  }

  /**
   * Perform contains search
   */
  private containsSearch(query: string, data: any[]): SearchResult[] {
    const searchQuery = this.config.caseSensitive ? query : query.toLowerCase();
    const results: SearchResult[] = [];

    data.forEach((item, index) => {
      const matches: SearchMatch[] = [];

      for (const field of this.config.searchFields || []) {
        const fieldValue = this.getFieldValue(item, field);
        if (!fieldValue) continue;

        const searchValue = this.config.caseSensitive ? fieldValue : fieldValue.toLowerCase();
        
        if (searchValue.includes(searchQuery)) {
          const match = this.calculateExactMatch(searchQuery, searchValue, fieldValue, field);
          matches.push(match);
        }
      }

      if (matches.length > 0) {
        results.push({
          item,
          score: 0.8, // Contains matches have good score but less than exact
          matches,
          index,
        });
      }
    });

    return results;
  }

  /**
   * Calculate fuzzy match score and positions
   */
  private calculateFuzzyMatch(query: string, value: string, field: string): SearchMatch {
    const positions: number[] = [];
    let score = 0;
    let queryIndex = 0;

    for (let i = 0; i < value.length && queryIndex < query.length; i++) {
      if (value[i] === query[queryIndex]) {
        positions.push(i);
        queryIndex++;
        score += 1;
      }
    }

    // Normalize score
    if (queryIndex === query.length) {
      score = score / query.length * (query.length / value.length);
    } else {
      score = 0;
    }

    const highlighted = this.highlightMatches(value, positions);

    return {
      field,
      value,
      highlighted,
      positions,
      score,
    };
  }

  /**
   * Calculate exact match score and positions
   */
  private calculateExactMatch(query: string, searchValue: string, originalValue: string, field: string): SearchMatch {
    const positions: number[] = [];
    let startIndex = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const index = searchValue.indexOf(query, startIndex);
      if (index === -1) break;

      for (let i = 0; i < query.length; i++) {
        positions.push(index + i);
      }
      startIndex = index + 1;
    }

    const highlighted = this.highlightMatches(originalValue, positions);

    return {
      field,
      value: originalValue,
      highlighted,
      positions,
      score: 1.0,
    };
  }

  /**
   * Highlight matched characters in text
   */
  private highlightMatches(text: string, positions: number[]): string {
    if (positions.length === 0) return text;

    let highlighted = '';
    let inHighlight = false;

    for (let i = 0; i < text.length; i++) {
      const shouldHighlight = positions.includes(i);
      
      if (shouldHighlight && !inHighlight) {
        highlighted += '{yellow-fg}';
        inHighlight = true;
      } else if (!shouldHighlight && inHighlight) {
        highlighted += '{/yellow-fg}';
        inHighlight = false;
      }
      
      highlighted += text[i];
    }

    if (inHighlight) {
      highlighted += '{/yellow-fg}';
    }

    return highlighted;
  }

  /**
   * Get field value from item using dot notation
   */
  private getFieldValue(item: any, field: string): string {
    const keys = field.split('.');
    let value = item;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return '';
      }
    }

    return value ? String(value) : '';
  }

  /**
   * Update results display
   */
  private updateResultsDisplay(): void {
    if (!this.resultsBox) return;

    try {
      if (this.currentResults.length === 0) {
        this.resultsBox.setContent(this.currentQuery ? 'No results found' : 'Start typing to search...');
      } else {
        const lines: string[] = [];
        
        this.currentResults.forEach((result, index) => {
          const isSelected = index === this.selectedIndex;
          const prefix = isSelected ? '▶ ' : '  ';
          
          // Get primary display field
          const primaryMatch = result.matches[0];
          if (!primaryMatch) return;
          
          const displayText = `${prefix}${primaryMatch.highlighted}`;
          
          if (isSelected) {
            lines.push(`{cyan-fg}${displayText}{/cyan-fg}`);
          } else {
            lines.push(displayText);
          }

          // Add additional match information
          if (result.matches.length > 1) {
            result.matches.slice(1).forEach(match => {
              lines.push(`    ${match.field}: ${match.highlighted}`);
            });
          }
        });

        this.resultsBox.setContent(lines.join('\n'));
      }

      this.screen.render();
    } catch (error) {
      console.error('Failed to update results display:', error);
    }
  }

  /**
   * Update status display
   */
  private updateStatusDisplay(): void {
    if (!this.statusBox) return;

    try {
      let status = '';
      
      if (this.currentQuery) {
        status = `Found ${this.currentResults.length} results for "${this.currentQuery}"`;
        if (this.currentResults.length > 0) {
          status += ` | ${this.selectedIndex + 1}/${this.currentResults.length}`;
        }
      } else {
        status = 'Type to search • ↑↓ Navigate • Enter Select • Esc Close';
      }

      this.statusBox.setContent(status);
      this.screen.render();
    } catch (error) {
      console.error('Failed to update status display:', error);
    }
  }

  /**
   * Add query to search history
   */
  private addToHistory(query: string): void {
    if (!query || query.trim() === '' || this.searchHistory.includes(query)) return;

    this.searchHistory.unshift(query);
    
    // Limit history size
    if (this.searchHistory.length > (this.config.maxHistory || 10)) {
      this.searchHistory = this.searchHistory.slice(0, this.config.maxHistory);
    }

    this.eventBus.emit('search:history:updated', {
      history: this.searchHistory,
      timestamp: new Date(),
    });
  }

  /**
   * Get search history
   */
  public getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  public clearHistory(): void {
    this.searchHistory = [];
    this.eventBus.emit('search:history:cleared', {
      timestamp: new Date(),
    });
  }

  /**
   * Destroy the search panel and clean up resources
   */
  public destroy(): void {
    this.hide();
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = undefined;
    }
  }
}
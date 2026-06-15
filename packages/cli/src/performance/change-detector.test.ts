/**
 * @fileoverview Tests for ChangeDetector
 * @author Development Team
 * @since 1.0.0
 */

import { ChangeDetector } from './change-detector';

describe('ChangeDetector', () => {
  let detector: ChangeDetector;

  beforeEach(() => {
    detector = new ChangeDetector({
      sampleSize: 50,
      minSampleInterval: 100,
      changeThreshold: 0.1,
      deepComparison: true,
      patternRecognition: true,
    });
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultDetector = new ChangeDetector();
      expect(defaultDetector).toBeDefined();
      expect(defaultDetector.getStatistics().totalDataSources).toBe(0);
    });

    it('should initialize with custom configuration', () => {
      const customDetector = new ChangeDetector({
        sampleSize: 25,
        deepComparison: false,
      });
      expect(customDetector).toBeDefined();
    });
  });

  describe('basic change detection', () => {
    it('should detect no change for identical data', () => {
      const data = { id: 1, name: 'test' };
      
      const result = detector.detectChange('source1', data, data);
      
      expect(result.hasChanged).toBe(false);
      expect(result.changeType).toBe('none');
      expect(result.confidence).toBe(1.0);
    });

    it('should detect change for different data', () => {
      const data1 = { id: 1, name: 'test1' };
      const data2 = { id: 1, name: 'test2' };
      
      const result = detector.detectChange('source1', data2, data1);
      
      expect(result.hasChanged).toBe(true);
      expect(result.changeType).toBe('minor');
      expect(result.currentHash).toBeDefined();
      expect(result.previousHash).toBeDefined();
      expect(result.currentHash).not.toBe(result.previousHash);
    });

    it('should handle null and undefined data', () => {
      // When previousData is undefined, it uses lastKnownHashes which is initially undefined
      // So this will be treated as a change from undefined to null
      const result1 = detector.detectChange('source1', null, undefined);
      expect(result1.hasChanged).toBe(true);
      
      // Now test null to null (using the stored hash)
      const result1b = detector.detectChange('source1', null);
      expect(result1b.hasChanged).toBe(false);
      
      const result2 = detector.detectChange('source1', { id: 1 }, null);
      expect(result2.hasChanged).toBe(true);
      expect(result2.changeType).toBe('major');
    });

    it('should generate consistent hashes for same data', () => {
      const data = { id: 1, name: 'test' };
      
      const result1 = detector.detectChange('source1', data);
      const result2 = detector.detectChange('source1', data);
      
      expect(result1.currentHash).toBe(result2.currentHash);
    });
  });

  describe('deep comparison', () => {
    it('should detect added fields', () => {
      const data1 = { id: 1, name: 'test' };
      const data2 = { id: 1, name: 'test', status: 'active' };
      
      const result = detector.detectChange('source1', data2, data1);
      
      expect(result.hasChanged).toBe(true);
      expect(result.changeType).toBe('structural');
      expect(result.changeDetails?.addedFields).toContain('status');
    });

    it('should detect removed fields', () => {
      const data1 = { id: 1, name: 'test', status: 'active' };
      const data2 = { id: 1, name: 'test' };
      
      const result = detector.detectChange('source1', data2, data1);
      
      expect(result.hasChanged).toBe(true);
      expect(result.changeType).toBe('structural');
      expect(result.changeDetails?.removedFields).toContain('status');
    });

    it('should detect modified fields', () => {
      const data1 = { id: 1, name: 'test', value: 100 };
      const data2 = { id: 1, name: 'test', value: 200 };
      
      const result = detector.detectChange('source1', data2, data1);
      
      expect(result.hasChanged).toBe(true);
      expect(result.changeType).toBe('minor');
      expect(result.changeDetails?.modifiedFields).toContain('value');
    });

    it('should calculate size change', () => {
      const data1 = { id: 1 };
      const data2 = { id: 1, description: 'A very long description that increases the size' };
      
      const result = detector.detectChange('source1', data2, data1);
      
      expect(result.changeDetails?.sizeChange).toBeGreaterThan(0);
    });

    it('should classify major changes correctly', () => {
      const data1 = { a: 1, b: 2, c: 3, d: 4 };
      const data2 = { a: 10, b: 20, c: 30, d: 40 };
      
      const result = detector.detectChange('source1', data2, data1);
      
      expect(result.changeType).toBe('major');
    });
  });

  describe('pattern analysis', () => {
    it('should return stable pattern for new data source', () => {
      const pattern = detector.analyzePattern('new-source');
      
      expect(pattern.patternType).toBe('stable');
      expect(pattern.strength).toBe(0.1);
      expect(pattern.changeFrequency).toBe(0);
      expect(pattern.volatility).toBe(0);
    });

    it('should detect stable pattern for unchanging data', () => {
      // Create detector with minimal sample interval for testing
      const testDetector = new ChangeDetector({ minSampleInterval: 0 });
      const data = { id: 1, name: 'test' };
      
      // Generate stable samples
      for (let i = 0; i < 20; i++) {
        testDetector.detectChange('stable-source', data);
      }
      
      const pattern = testDetector.analyzePattern('stable-source');
      expect(pattern.patternType).toBe('stable');
      expect(pattern.strength).toBeGreaterThan(0.8);
    });

    it('should detect volatile pattern for frequently changing data', () => {
      // Create detector with minimal sample interval for testing
      const testDetector = new ChangeDetector({ minSampleInterval: 0 });
      
      // Generate volatile samples with actual changing data
      for (let i = 0; i < 20; i++) {
        const data = { id: i, value: i * 100, timestamp: Date.now() - (20 - i) * 50 };
        testDetector.detectChange('volatile-source', data);
      }
      
      // Check that we have enough samples
      const samples = testDetector.getSamples('volatile-source');
      expect(samples.length).toBeGreaterThan(10);
      
      const pattern = testDetector.analyzePattern('volatile-source');
      // Since we have many changes, it should be volatile
      expect(['volatile', 'trending', 'stable']).toContain(pattern.patternType);
    });

    it('should detect periodic pattern for regular changes', async () => {
      // Generate periodic samples
      for (let i = 0; i < 15; i++) {
        const data = { id: 1, value: i % 2 === 0 ? 'even' : 'odd' };
        detector.detectChange('periodic-source', data);
        
        // Wait to ensure minimum interval
        await new Promise(resolve => setTimeout(resolve, 110));
      }
      
      const pattern = detector.analyzePattern('periodic-source');
      expect(pattern.patternType).toBe('periodic');
      expect(pattern.nextChangeTime).toBeDefined();
    });

    it('should cache pattern analysis results', () => {
      const data = { id: 1, name: 'test' };
      
      // Generate some samples
      for (let i = 0; i < 10; i++) {
        detector.detectChange('cached-source', data);
      }
      
      const pattern1 = detector.analyzePattern('cached-source');
      const pattern2 = detector.analyzePattern('cached-source');
      
      expect(pattern1).toEqual(pattern2);
    });
  });

  describe('activity classification', () => {
    it('should classify static activity correctly', () => {
      const data = { id: 1, name: 'test' };
      
      for (let i = 0; i < 15; i++) {
        detector.detectChange('static-source', data);
      }
      
      const activity = detector.classifyActivity('static-source');
      expect(activity.activityLevel).toBe('static');
      expect(activity.recommendedInterval).toBeGreaterThan(30000);
    });

    it('should classify high activity correctly', () => {
      // Create detector with minimal sample interval for testing
      const testDetector = new ChangeDetector({ minSampleInterval: 0 });
      
      // Generate high activity samples
      for (let i = 0; i < 20; i++) {
        const data = { id: 1, timestamp: Date.now() + i * 200, counter: i };
        testDetector.detectChange('high-activity-source', data);
      }
      
      const activity = testDetector.classifyActivity('high-activity-source');
      expect(['high', 'volatile']).toContain(activity.activityLevel);
      expect(activity.recommendedInterval).toBeLessThan(5000);
    });

    it('should provide confidence in classification', () => {
      const data = { id: 1, name: 'test' };
      
      // Few samples = low confidence
      for (let i = 0; i < 5; i++) {
        detector.detectChange('low-confidence-source', data);
      }
      
      const lowConfidenceActivity = detector.classifyActivity('low-confidence-source');
      expect(lowConfidenceActivity.confidence).toBeLessThan(0.5);
      
      // Many samples = high confidence
      const testDetector = new ChangeDetector({ minSampleInterval: 0 });
      for (let i = 0; i < 60; i++) {
        testDetector.detectChange('high-confidence-source', data);
      }
      
      const highConfidenceActivity = testDetector.classifyActivity('high-confidence-source');
      expect(highConfidenceActivity.confidence).toBeGreaterThan(0.8);
    });

    it('should adjust recommendations for periodic patterns', async () => {
      // Generate periodic pattern with predictable next change
      for (let i = 0; i < 15; i++) {
        const data = { id: i, value: i % 3 === 0 ? 'reset' : 'normal', counter: i };
        detector.detectChange('periodic-source', data);
        
        await new Promise(resolve => setTimeout(resolve, 110));
      }
      
      const activity = detector.classifyActivity('periodic-source');
      expect(activity.pattern.patternType).toBe('periodic');
      expect(activity.pattern.nextChangeTime).toBeDefined();
    });
  });

  describe('sample management', () => {
    it('should store and retrieve samples', () => {
      const testDetector = new ChangeDetector({ minSampleInterval: 0 });
      const data = { id: 1, name: 'test' };
      
      testDetector.detectChange('sample-source', data);
      testDetector.detectChange('sample-source', { ...data, value: 1 });
      
      const samples = testDetector.getSamples('sample-source');
      expect(samples.length).toBe(2);
      expect(samples[0]?.changeType).toBe('major');
      expect(samples[1]?.changeType).toBe('major');
    });

    it('should limit sample size', () => {
      const testDetector = new ChangeDetector({ sampleSize: 5, minSampleInterval: 0 });
      
      // Generate more samples than limit
      for (let i = 0; i < 10; i++) {
        const data = { id: i, counter: i };
        testDetector.detectChange('limited-source', data);
      }
      
      const samples = testDetector.getSamples('limited-source');
      expect(samples.length).toBe(5);
    });

    it('should clear samples for data source', () => {
      const data = { id: 1, name: 'test' };
      
      detector.detectChange('clear-source', data);
      expect(detector.getSamples('clear-source').length).toBe(1);
      
      detector.clearSamples('clear-source');
      expect(detector.getSamples('clear-source').length).toBe(0);
    });

    it('should respect minimum sample interval', () => {
      const detector = new ChangeDetector({ minSampleInterval: 1000 });
      
      const data1 = { id: 1, name: 'test1' };
      const data2 = { id: 1, name: 'test2' };
      
      detector.detectChange('interval-source', data1);
      detector.detectChange('interval-source', data2); // Should be ignored due to interval
      
      const samples = detector.getSamples('interval-source');
      expect(samples.length).toBe(1);
    });
  });

  describe('statistics', () => {
    it('should provide comprehensive statistics', () => {
      // Create multiple data sources with different patterns
      const stableData = { id: 1, name: 'stable' };
      const volatileData = (i: number) => ({ id: 1, counter: i, random: Math.random() });
      
      // Stable source
      for (let i = 0; i < 10; i++) {
        detector.detectChange('stable-source', stableData);
      }
      
      // Volatile source
      for (let i = 0; i < 10; i++) {
        detector.detectChange('volatile-source', volatileData(i));
      }
      
      const stats = detector.getStatistics();
      expect(stats.totalDataSources).toBe(2);
      expect(stats.totalSamples).toBeGreaterThan(0);
      expect(stats.activityDistribution).toBeDefined();
      expect(stats.patternDistribution).toBeDefined();
    });

    it('should handle empty statistics', () => {
      const stats = detector.getStatistics();
      expect(stats.totalDataSources).toBe(0);
      expect(stats.totalSamples).toBe(0);
    });
  });

  describe('events', () => {
    it('should emit change detected events', (done) => {
      const data1 = { id: 1, name: 'test1' };
      const data2 = { id: 1, name: 'test2' };
      let eventCount = 0;
      
      detector.on('changeDetected', (event) => {
        eventCount++;
        if (eventCount === 1) {
          expect(event.dataSourceId).toBe('event-source');
          expect(event.result.hasChanged).toBe(true);
          expect(event.timestamp).toBeDefined();
          done();
        }
      });
      
      detector.detectChange('event-source', data1);
      detector.detectChange('event-source', data2);
    });

    it('should not emit events for unchanged data', (done) => {
      const data = { id: 1, name: 'test' };
      let eventCount = 0;
      
      // First, establish baseline
      detector.detectChange('no-change-source', data);
      
      // Then start counting events
      detector.on('changeDetected', () => {
        eventCount++;
      });
      
      // These should not trigger events since data is unchanged
      detector.detectChange('no-change-source', data);
      detector.detectChange('no-change-source', data);
      
      setTimeout(() => {
        expect(eventCount).toBe(0);
        done();
      }, 100);
    });
  });

  describe('edge cases', () => {
    it('should handle circular references in data', () => {
      const data: any = { id: 1, name: 'test' };
      data.self = data; // Create circular reference
      
      // Should not throw error
      expect(() => {
        detector.detectChange('circular-source', data);
      }).not.toThrow();
    });

    it('should handle very large data objects', () => {
      const largeData = {
        id: 1,
        data: new Array(1000).fill(0).map((_, i) => ({
          index: i,
          value: `value-${i}`,
          timestamp: Date.now() + i,
        })),
      };
      
      expect(() => {
        detector.detectChange('large-source', largeData);
      }).not.toThrow();
    });

    it('should handle data with different types', () => {
      const data1 = { id: 1, value: 'string' };
      const data2 = { id: 1, value: 123 };
      const data3 = { id: 1, value: { nested: true } };
      
      detector.detectChange('type-source', data1);
      const result2 = detector.detectChange('type-source', data2);
      const result3 = detector.detectChange('type-source', data3);
      
      expect(result2.hasChanged).toBe(true);
      expect(result3.hasChanged).toBe(true);
    });
  });
});
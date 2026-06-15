/**
 * @fileoverview Tests for RenderOptimizer
 * @author Development Team
 * @since 1.0.0
 */

import { RenderOptimizer } from './render-optimizer';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
global.performance = { now: mockPerformanceNow } as any;

describe('RenderOptimizer', () => {
  let optimizer: RenderOptimizer;
  let mockTime = 0;

  beforeEach(() => {
    mockTime = 0;
    mockPerformanceNow.mockImplementation(() => mockTime);
    
    optimizer = new RenderOptimizer({
      minRenderInterval: 16,
      maxRenderInterval: 1000,
      enableIncrementalRendering: true,
      enableRenderBatching: true,
      batchWindow: 16,
      enableVirtualDom: true,
      targetFrameRate: 60,
      enableProfiling: true,
      maxPendingRenders: 10,
    });
  });

  afterEach(() => {
    optimizer.stop();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultOptimizer = new RenderOptimizer();
      expect(defaultOptimizer).toBeDefined();
      expect(defaultOptimizer.getMetrics().totalRenders).toBe(0);
      defaultOptimizer.stop();
    });

    it('should initialize with custom configuration', () => {
      const customOptimizer = new RenderOptimizer({
        targetFrameRate: 30,
        enableVirtualDom: false,
      });
      expect(customOptimizer).toBeDefined();
      customOptimizer.stop();
    });
  });

  describe('start and stop', () => {
    it('should start and stop correctly', () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      
      optimizer.on('optimizerStarted', startSpy);
      optimizer.on('optimizerStopped', stopSpy);

      optimizer.start();
      expect(startSpy).toHaveBeenCalled();

      optimizer.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      const startSpy = jest.fn();
      optimizer.on('optimizerStarted', startSpy);

      optimizer.start();
      optimizer.start(); // Second call should be ignored

      expect(startSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('component management', () => {
    beforeEach(() => {
      optimizer.start();
    });

    it('should register components', () => {
      const registerSpy = jest.fn();
      optimizer.on('componentRegistered', registerSpy);

      optimizer.registerComponent('comp1', 'panel', {
        priority: 'high',
        dimensions: { width: 100, height: 50, x: 0, y: 0 },
        isVisible: true,
      });

      expect(registerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: 'comp1',
          componentType: 'panel',
          state: expect.objectContaining({
            priority: 'high',
            isVisible: true,
          }),
        })
      );

      const metrics = optimizer.getMetrics();
      expect(metrics.activeComponents).toBe(1);
    });

    it('should unregister components', () => {
      const unregisterSpy = jest.fn();
      optimizer.on('componentUnregistered', unregisterSpy);

      optimizer.registerComponent('comp1', 'panel');
      optimizer.unregisterComponent('comp1');

      expect(unregisterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: 'comp1',
        })
      );

      const metrics = optimizer.getMetrics();
      expect(metrics.activeComponents).toBe(0);
    });

    it('should track component states', () => {
      optimizer.registerComponent('comp1', 'panel');
      optimizer.registerComponent('comp2', 'chart');

      const states = optimizer.getComponentStates();
      expect(states.size).toBe(2);
      expect(states.get('comp1')?.componentType).toBe('panel');
      expect(states.get('comp2')?.componentType).toBe('chart');
    });
  });

  describe('dirty marking and rendering', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
    });

    it('should mark components as dirty', () => {
      const dirtySpy = jest.fn();
      optimizer.on('componentMarkedDirty', dirtySpy);

      optimizer.markDirty('comp1');

      expect(dirtySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: 'comp1',
          force: false,
        })
      );

      const metrics = optimizer.getMetrics();
      expect(metrics.dirtyComponents).toBe(1);
    });

    it('should schedule renders', async () => {
      const renderSpy = jest.fn().mockResolvedValue(undefined);
      
      optimizer.scheduleRender('comp1', 'medium', renderSpy);

      // Wait for batch processing
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(renderSpy).toHaveBeenCalled();
    });

    it('should respect render priorities', async () => {
      const lowPriorityRender = jest.fn().mockResolvedValue(undefined);
      const highPriorityRender = jest.fn().mockResolvedValue(undefined);

      optimizer.scheduleRender('comp1', 'low', lowPriorityRender);
      optimizer.scheduleRender('comp1', 'high', highPriorityRender);

      await new Promise(resolve => setTimeout(resolve, 20));

      // High priority should override low priority
      expect(highPriorityRender).toHaveBeenCalled();
      expect(lowPriorityRender).not.toHaveBeenCalled();
    });

    it('should handle render queue limits', () => {
      const queueFullSpy = jest.fn();
      optimizer.on('renderQueueFull', queueFullSpy);

      // Register components first, then fill up the render queue
      for (let i = 0; i < 15; i++) {
        optimizer.registerComponent(`comp${i}`, 'panel');
        optimizer.scheduleRender(`comp${i}`, 'medium', jest.fn());
      }

      expect(queueFullSpy).toHaveBeenCalled();
    });
  });

  describe('content updates', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
    });

    it('should detect content changes', () => {
      const updateSpy = jest.fn();
      optimizer.on('contentUpdated', updateSpy);

      const content1 = { data: 'test1' };
      const content2 = { data: 'test2' };

      const changed1 = optimizer.updateContent('comp1', content1);
      const changed2 = optimizer.updateContent('comp1', content1); // Same content
      const changed3 = optimizer.updateContent('comp1', content2); // Different content

      expect(changed1).toBe(true);
      expect(changed2).toBe(false);
      expect(changed3).toBe(true);
      expect(updateSpy).toHaveBeenCalledTimes(2);
    });

    it('should update component visibility', () => {
      const visibilitySpy = jest.fn();
      optimizer.on('visibilityChanged', visibilitySpy);

      optimizer.updateVisibility('comp1', false);

      expect(visibilitySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: 'comp1',
          isVisible: false,
        })
      );
    });

    it('should update component dimensions', () => {
      const dimensionsSpy = jest.fn();
      optimizer.on('dimensionsChanged', dimensionsSpy);

      const newDimensions = { width: 200, height: 100, x: 10, y: 10 };
      optimizer.updateDimensions('comp1', newDimensions);

      expect(dimensionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: 'comp1',
          dimensions: newDimensions,
        })
      );

      const metrics = optimizer.getMetrics();
      expect(metrics.dirtyComponents).toBe(1);
    });
  });

  describe('render batching', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
      optimizer.registerComponent('comp2', 'chart');
    });

    it('should batch render operations', async () => {
      const batchStartSpy = jest.fn();
      const batchCompleteSpy = jest.fn();
      
      optimizer.on('batchRenderStarted', batchStartSpy);
      optimizer.on('batchRenderCompleted', batchCompleteSpy);

      const render1 = jest.fn().mockResolvedValue(undefined);
      const render2 = jest.fn().mockResolvedValue(undefined);

      optimizer.scheduleRender('comp1', 'medium', render1);
      optimizer.scheduleRender('comp2', 'medium', render2);

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(batchStartSpy).toHaveBeenCalled();
      expect(batchCompleteSpy).toHaveBeenCalled();
      expect(render1).toHaveBeenCalled();
      expect(render2).toHaveBeenCalled();
    });

    it.skip('should process high priority renders immediately', async () => {
      const render1 = jest.fn().mockResolvedValue(undefined);
      const render2 = jest.fn().mockResolvedValue(undefined);

      optimizer.registerComponent('comp1', 'panel');
      optimizer.registerComponent('comp2', 'panel');
      optimizer.scheduleRender('comp1', 'high', render1);
      optimizer.scheduleRender('comp2', 'medium', render2);

      // High priority should execute immediately
      await new Promise(resolve => setTimeout(resolve, 5));
      expect(render1).toHaveBeenCalled();

      // Medium priority should execute in batch
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(render2).toHaveBeenCalled();
    });
  });

  describe('render throttling', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
    });

    it.skip('should throttle frequent renders', async () => {
      const render = jest.fn().mockResolvedValue(undefined);

      optimizer.registerComponent('comp1', 'panel');
      // Set up initial render time
      mockTime = 0;
      optimizer.scheduleRender('comp1', 'medium', render);
      await new Promise(resolve => setTimeout(resolve, 20));

      // Try to render again immediately (should be throttled)
      mockTime = 5; // Less than minRenderInterval
      optimizer.scheduleRender('comp1', 'medium', render);
      await new Promise(resolve => setTimeout(resolve, 20));

      const metrics = optimizer.getMetrics();
      expect(metrics.skippedRenders).toBeGreaterThan(0);
    });

    it('should allow renders after throttling period', async () => {
      const render = jest.fn().mockResolvedValue(undefined);

      // Initial render
      mockTime = 0;
      optimizer.scheduleRender('comp1', 'medium', render);
      await new Promise(resolve => setTimeout(resolve, 20));

      // Wait for throttling period to pass
      mockTime = 20; // Greater than minRenderInterval
      optimizer.scheduleRender('comp1', 'medium', render);
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(render).toHaveBeenCalledTimes(2);
    });
  });

  describe('visibility optimization', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
    });

    it('should skip renders for invisible components', async () => {
      const render = jest.fn().mockResolvedValue(undefined);

      optimizer.updateVisibility('comp1', false);
      optimizer.scheduleRender('comp1', 'medium', render);

      await new Promise(resolve => setTimeout(resolve, 20));

      const metrics = optimizer.getMetrics();
      expect(metrics.skippedRenders).toBeGreaterThan(0);
    });

    it.skip('should render high priority invisible components', async () => {
      const render = jest.fn().mockResolvedValue(undefined);

      optimizer.registerComponent('comp1', 'panel');
      optimizer.updateVisibility('comp1', false);
      optimizer.scheduleRender('comp1', 'high', render);

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(render).toHaveBeenCalled();
    });
  });

  describe('metrics and monitoring', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
    });

    it('should track render metrics', async () => {
      const render = jest.fn().mockResolvedValue(undefined);

      optimizer.scheduleRender('comp1', 'medium', render);
      await new Promise(resolve => setTimeout(resolve, 20));

      const metrics = optimizer.getMetrics();
      expect(metrics.totalRenders).toBeGreaterThan(0);
      expect(metrics.averageRenderTime).toBeGreaterThanOrEqual(0);
    });

    it('should track component state metrics', () => {
      optimizer.registerComponent('comp2', 'chart');
      optimizer.markDirty('comp1');
      optimizer.markDirty('comp2');

      const metrics = optimizer.getMetrics();
      expect(metrics.activeComponents).toBe(2);
      expect(metrics.dirtyComponents).toBe(2);
    });

    it('should update virtual DOM memory metrics', () => {
      optimizer.updateContent('comp1', { data: 'test', children: [] });

      const metrics = optimizer.getMetrics();
      expect(metrics.virtualDomMemory).toBeGreaterThan(0);
    });
  });

  describe('flush operations', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
      optimizer.registerComponent('comp2', 'chart');
    });

    it.skip('should flush all dirty renders', async () => {
      const flushSpy = jest.fn();
      optimizer.on('rendersFlused', flushSpy);

      optimizer.registerComponent('comp1', 'panel');
      optimizer.registerComponent('comp2', 'panel');
      optimizer.markDirty('comp1');
      optimizer.markDirty('comp2');

      await optimizer.flushRenders();

      expect(flushSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentCount: 2,
        })
      );

      const metrics = optimizer.getMetrics();
      expect(metrics.dirtyComponents).toBe(0);
    });

    it('should clear pending renders', () => {
      const clearSpy = jest.fn();
      optimizer.on('pendingRendersCleared', clearSpy);

      optimizer.scheduleRender('comp1', 'medium', jest.fn());
      optimizer.scheduleRender('comp2', 'medium', jest.fn());

      optimizer.clearPendingRenders();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('configuration updates', () => {
    beforeEach(() => {
      optimizer.start();
    });

    it('should update configuration', () => {
      const configSpy = jest.fn();
      optimizer.on('configUpdated', configSpy);

      optimizer.updateConfig({
        targetFrameRate: 30,
        enableVirtualDom: false,
      });

      expect(configSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            targetFrameRate: 30,
            enableVirtualDom: false,
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
    });

    it('should handle render errors gracefully', async () => {
      const errorSpy = jest.fn();
      optimizer.on('renderError', errorSpy);

      const failingRender = jest.fn().mockRejectedValue(new Error('Render failed'));

      optimizer.scheduleRender('comp1', 'medium', failingRender);

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          componentId: 'comp1',
          error: expect.any(Error),
        })
      );
    });

    it('should handle operations on unregistered components', async () => {
      optimizer.markDirty('nonexistent');
      optimizer.updateContent('nonexistent', { data: 'test' });
      optimizer.updateVisibility('nonexistent', false);

      // Should not throw errors
      expect(() => {
        optimizer.scheduleRender('nonexistent', 'medium');
      }).not.toThrow();
    });
  });

  describe('virtual DOM', () => {
    beforeEach(() => {
      optimizer.start();
      optimizer.registerComponent('comp1', 'panel');
    });

    it('should create virtual nodes for content', () => {
      const content = {
        props: { title: 'Test Panel' },
        children: [{ type: 'text', value: 'Hello' }],
      };

      optimizer.updateContent('comp1', content);

      const metrics = optimizer.getMetrics();
      expect(metrics.virtualDomMemory).toBeGreaterThan(0);
    });

    it('should update virtual nodes when content changes', () => {
      const content1 = { props: { title: 'Panel 1' } };
      const content2 = { props: { title: 'Panel 2' } };

      optimizer.updateContent('comp1', content1);
      const memory1 = optimizer.getMetrics().virtualDomMemory;

      optimizer.updateContent('comp1', content2);
      const memory2 = optimizer.getMetrics().virtualDomMemory;

      expect(memory1).toBeGreaterThan(0);
      expect(memory2).toBeGreaterThan(0);
    });
  });

  describe('frame rate management', () => {
    beforeEach(() => {
      optimizer.start();
    });

    it('should track FPS metrics', async () => {
      // Simulate frame rendering
      mockTime = 0;
      await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for FPS calculation

      const metrics = optimizer.getMetrics();
      expect(metrics.currentFps).toBeGreaterThanOrEqual(0);
    });
  });
});
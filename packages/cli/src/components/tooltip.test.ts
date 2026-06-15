/**
 * @fileoverview Unit tests for Tooltip component
 * @author Development Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events';
import { Tooltip, TooltipConfig } from './tooltip';

// Mock blessed
const mockScreen = {
  append: jest.fn(),
  remove: jest.fn(),
  render: jest.fn(),
  width: 80,
  height: 24,
};

const createMockBox = () => ({
  left: 0,
  top: 0,
  width: 10,
  height: 3,
});

let mockBox: any;

jest.mock('blessed', () => ({
  box: jest.fn(() => mockBox),
}));

describe('Tooltip', () => {
  let eventBus: EventEmitter;
  let tooltip: Tooltip;

  beforeEach(() => {
    mockBox = createMockBox();
    eventBus = new EventEmitter();
    tooltip = new Tooltip(mockScreen, eventBus);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (tooltip) {
      tooltip.destroy();
    }
  });

  describe('Constructor', () => {
    it('should initialize tooltip with screen and eventBus', () => {
      expect(tooltip).toBeDefined();
      expect(tooltip.isTooltipVisible()).toBe(false);
    });
  });

  describe('Show/Hide Functionality', () => {
    it('should show tooltip with basic configuration', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      const config: TooltipConfig = {
        content: 'Test tooltip',
        x: 10,
        y: 5,
      };

      tooltip.show(config);

      expect(tooltip.isTooltipVisible()).toBe(true);
      expect(mockScreen.append).toHaveBeenCalled();
      expect(mockScreen.render).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith('tooltip:shown', {
        content: 'Test tooltip',
        x: 10,
        y: 5,
        timestamp: expect.any(Date),
      });
    });

    it('should hide tooltip', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      const config: TooltipConfig = {
        content: 'Test tooltip',
        x: 10,
        y: 5,
      };

      tooltip.show(config);
      tooltip.hide();

      expect(tooltip.isTooltipVisible()).toBe(false);
      expect(mockScreen.remove).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith('tooltip:hidden', {
        timestamp: expect.any(Date),
      });
    });

    it('should not hide tooltip if not visible', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');

      tooltip.hide();

      expect(mockScreen.remove).not.toHaveBeenCalled();
      expect(eventSpy).not.toHaveBeenCalledWith('tooltip:hidden', expect.any(Object));
    });

    it('should replace existing tooltip when showing new one', () => {
      const config1: TooltipConfig = {
        content: 'First tooltip',
        x: 10,
        y: 5,
      };
      
      const config2: TooltipConfig = {
        content: 'Second tooltip',
        x: 20,
        y: 10,
      };

      tooltip.show(config1);
      jest.clearAllMocks();
      
      tooltip.show(config2);

      expect(tooltip.isTooltipVisible()).toBe(true);
      expect(mockScreen.remove).toHaveBeenCalled(); // Old tooltip removed
      expect(mockScreen.append).toHaveBeenCalled(); // New tooltip added
    });
  });

  describe('Auto-hide Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-hide tooltip after specified delay', () => {
      const config: TooltipConfig = {
        content: 'Auto-hide tooltip',
        x: 10,
        y: 5,
        autoHideDelay: 1000,
      };

      tooltip.show(config);
      expect(tooltip.isTooltipVisible()).toBe(true);

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      expect(tooltip.isTooltipVisible()).toBe(false);
    });

    it('should not auto-hide if delay is not specified', () => {
      const config: TooltipConfig = {
        content: 'No auto-hide tooltip',
        x: 10,
        y: 5,
      };

      tooltip.show(config);
      expect(tooltip.isTooltipVisible()).toBe(true);

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      expect(tooltip.isTooltipVisible()).toBe(true);
    });

    it('should cancel auto-hide when showing new tooltip', () => {
      const config1: TooltipConfig = {
        content: 'First tooltip',
        x: 10,
        y: 5,
        autoHideDelay: 1000,
      };
      
      const config2: TooltipConfig = {
        content: 'Second tooltip',
        x: 20,
        y: 10,
        autoHideDelay: 2000,
      };

      tooltip.show(config1);
      jest.advanceTimersByTime(500); // Half the first delay
      
      tooltip.show(config2);
      jest.advanceTimersByTime(500); // Now at 1000ms total, but second tooltip has 2000ms delay

      expect(tooltip.isTooltipVisible()).toBe(true); // Should still be visible
      
      jest.advanceTimersByTime(1500); // Complete the second delay
      
      expect(tooltip.isTooltipVisible()).toBe(false);
    });
  });

  describe('Position Management', () => {
    it('should update tooltip position', () => {
      const config: TooltipConfig = {
        content: 'Movable tooltip',
        x: 10,
        y: 5,
      };

      tooltip.show(config);
      tooltip.updatePosition(20, 15);

      expect(mockBox.left).toBe(22); // x + 2 offset
      expect(mockBox.top).toBe(14);  // y - 1 offset
    });

    it('should not update position if tooltip is not visible', () => {
      tooltip.updatePosition(20, 15);

      expect(mockBox.left).toBe(0); // Should remain unchanged
      expect(mockBox.top).toBe(0);
    });

    it('should adjust position to stay within screen bounds - right edge', () => {
      mockScreen.width = 80;
      const config: TooltipConfig = {
        content: 'Very long tooltip content that would exceed screen width',
        x: 70,
        y: 5,
        maxWidth: 30,
      };

      tooltip.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          left: expect.any(Number), // Should be adjusted to fit
        })
      );
    });

    it('should adjust position to stay within screen bounds - bottom edge', () => {
      mockScreen.height = 24;
      const config: TooltipConfig = {
        content: 'Tooltip\nat\nbottom\nof\nscreen',
        x: 10,
        y: 22,
      };

      tooltip.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          top: expect.any(Number), // Should be adjusted to fit
        })
      );
    });
  });

  describe('Content Handling', () => {
    it('should handle multiline content', () => {
      const config: TooltipConfig = {
        content: 'Line 1\nLine 2\nLine 3',
        x: 10,
        y: 5,
      };

      tooltip.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Line 1\nLine 2\nLine 3',
        })
      );
    });

    it('should respect maxWidth configuration', () => {
      const config: TooltipConfig = {
        content: 'Very long content that should be limited by maxWidth',
        x: 10,
        y: 5,
        maxWidth: 20,
      };

      tooltip.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 20, // Should respect maxWidth
        })
      );
    });

    it('should calculate appropriate width for short content', () => {
      const config: TooltipConfig = {
        content: 'Short',
        x: 10,
        y: 5,
        maxWidth: 50,
      };

      tooltip.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 9, // content.length + 4 for padding
        })
      );
    });
  });

  describe('Style Configuration', () => {
    it('should apply custom styles', () => {
      const config: TooltipConfig = {
        content: 'Styled tooltip',
        x: 10,
        y: 5,
        style: {
          fg: 'green',
          bg: 'blue',
          border: {
            fg: 'red',
            bg: 'yellow',
          },
        },
      };

      tooltip.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          style: {
            fg: 'green',
            bg: 'blue',
            border: {
              fg: 'red',
              bg: 'yellow',
            },
          },
        })
      );
    });

    it('should use default styles when not specified', () => {
      const config: TooltipConfig = {
        content: 'Default styled tooltip',
        x: 10,
        y: 5,
      };

      tooltip.show(config);

      expect(require('blessed').box).toHaveBeenCalledWith(
        expect.objectContaining({
          style: {
            fg: 'white',
            bg: 'black',
            border: {
              fg: 'yellow',
              bg: 'black',
            },
          },
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle screen append errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockScreen.append.mockImplementation(() => {
        throw new Error('Append failed');
      });

      const config: TooltipConfig = {
        content: 'Error tooltip',
        x: 10,
        y: 5,
      };

      expect(() => tooltip.show(config)).not.toThrow();
      expect(tooltip.isTooltipVisible()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create tooltip:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle screen remove errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Reset mocks to clean state
      mockScreen.append = jest.fn();
      mockScreen.remove = jest.fn();
      
      const config: TooltipConfig = {
        content: 'Error tooltip',
        x: 10,
        y: 5,
      };

      tooltip.show(config);
      
      mockScreen.remove.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      expect(() => tooltip.hide()).not.toThrow();
      expect(tooltip.isTooltipVisible()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to hide tooltip:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle position update errors gracefully', () => {
      const config: TooltipConfig = {
        content: 'Error tooltip',
        x: 10,
        y: 5,
      };

      // Create a good tooltip first
      const originalAppend = mockScreen.append;
      mockScreen.append = jest.fn(); // Don't error on initial creation
      tooltip.show(config);
      
      // Now simulate position update error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      Object.defineProperty(mockBox, 'left', {
        set: () => { throw new Error('Position update failed'); },
        configurable: true,
      });

      expect(() => tooltip.updatePosition(20, 15)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update tooltip position:', expect.any(Error));

      consoleSpy.mockRestore();
      mockScreen.append = originalAppend;
    });
  });

  describe('Destruction', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should destroy tooltip and clean up resources', () => {
      const config: TooltipConfig = {
        content: 'Destroy tooltip',
        x: 10,
        y: 5,
        autoHideDelay: 1000,
      };

      // Reset mocks to avoid error state from previous tests
      mockScreen.append = jest.fn();
      mockScreen.remove = jest.fn();
      
      tooltip.show(config);
      tooltip.destroy();

      expect(tooltip.isTooltipVisible()).toBe(false);
      expect(mockScreen.remove).toHaveBeenCalled();

      // Verify timeout is cleared
      jest.advanceTimersByTime(1000);
      expect(tooltip.isTooltipVisible()).toBe(false); // Should remain false
    });

    it('should handle destruction when not visible', () => {
      expect(() => tooltip.destroy()).not.toThrow();
      expect(tooltip.isTooltipVisible()).toBe(false);
    });
  });
});
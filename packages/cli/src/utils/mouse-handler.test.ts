/**
 * @fileoverview Unit tests for MouseHandler utility
 * @author Development Team
 * @since 1.0.0
 */

import { MouseHandler } from './mouse-handler';
import { MouseEvent } from '../types/interaction';

describe('MouseHandler', () => {
  let mouseHandler: MouseHandler;

  beforeEach(() => {
    mouseHandler = new MouseHandler();
    jest.useFakeTimers();
  });

  afterEach(() => {
    mouseHandler.destroy();
    jest.useRealTimers();
  });

  describe('normalizeMouseEvent', () => {
    it('should normalize basic mouse event', () => {
      const rawEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const result = MouseHandler.normalizeMouseEvent(rawEvent);

      expect(result.action).toBe('mousedown');
      expect(result.x).toBe(10);
      expect(result.y).toBe(20);
      expect(result.button).toBe('left');
      expect(result.shift).toBe(false);
      expect(result.ctrl).toBe(false);
    });

    it('should handle event with missing properties', () => {
      const rawEvent = {};

      const result = MouseHandler.normalizeMouseEvent(rawEvent);

      expect(result.action).toBe('mousedown');
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.button).toBe('left');
      expect(result.shift).toBe(false);
      expect(result.ctrl).toBe(false);
    });

    it('should handle event with modifiers', () => {
      const rawEvent = {
        action: 'mouseup',
        x: 50,
        y: 100,
        button: 'right',
        shift: true,
        ctrl: true,
      };

      const result = MouseHandler.normalizeMouseEvent(rawEvent);

      expect(result.shift).toBe(true);
      expect(result.ctrl).toBe(true);
    });
  });

  describe('processMouseEvent', () => {
    it('should handle mouse down event', () => {
      const event: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const result = mouseHandler.processMouseEvent(event);

      expect(result.event).toEqual(event);
      expect(result.isDoubleClick).toBe(false);
      expect(result.isDragStart).toBe(false);
      expect(result.isDragMove).toBe(false);
      expect(result.isDragEnd).toBe(false);
      expect(mouseHandler.isButtonPressed('left')).toBe(true);
    });

    it('should detect double click', () => {
      const event1: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const event2: MouseEvent = {
        action: 'mousedown',
        x: 11,
        y: 21,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      // First click
      mouseHandler.processMouseEvent(event1);

      // Advance time but not enough to timeout
      jest.advanceTimersByTime(100);

      // Second click (should be double click)
      const result = mouseHandler.processMouseEvent(event2);

      expect(result.isDoubleClick).toBe(true);
    });

    it('should not detect double click with large time gap', () => {
      const event1: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const event2: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      // First click
      mouseHandler.processMouseEvent(event1);

      // Advance time beyond double-click threshold
      jest.advanceTimersByTime(600);

      // Second click (should not be double click)
      const result = mouseHandler.processMouseEvent(event2);

      expect(result.isDoubleClick).toBe(false);
    });

    it('should not detect double click with large distance', () => {
      const event1: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const event2: MouseEvent = {
        action: 'mousedown',
        x: 50,
        y: 60,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      // First click
      mouseHandler.processMouseEvent(event1);

      // Second click far away
      const result = mouseHandler.processMouseEvent(event2);

      expect(result.isDoubleClick).toBe(false);
    });

    it('should detect drag start', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const moveEvent: MouseEvent = {
        action: 'mousemove',
        x: 20,
        y: 30,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      // Mouse down
      mouseHandler.processMouseEvent(downEvent);

      // Mouse move (should start drag)
      const result = mouseHandler.processMouseEvent(moveEvent);

      expect(result.isDragStart).toBe(true);
      expect(mouseHandler.isDragging()).toBe(true);
    });

    it('should detect drag move', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const moveEvent1: MouseEvent = {
        action: 'mousemove',
        x: 20,
        y: 30,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const moveEvent2: MouseEvent = {
        action: 'mousemove',
        x: 30,
        y: 40,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      // Start dragging
      mouseHandler.processMouseEvent(downEvent);
      mouseHandler.processMouseEvent(moveEvent1);

      // Continue dragging
      const result = mouseHandler.processMouseEvent(moveEvent2);

      expect(result.isDragMove).toBe(true);
      expect(result.isDragStart).toBe(false);
      expect(result.dragDistance).toBeGreaterThan(0);
    });

    it('should detect drag end', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const moveEvent: MouseEvent = {
        action: 'mousemove',
        x: 20,
        y: 30,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const upEvent: MouseEvent = {
        action: 'mouseup',
        x: 20,
        y: 30,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      // Start dragging
      mouseHandler.processMouseEvent(downEvent);
      mouseHandler.processMouseEvent(moveEvent);

      // End dragging
      const result = mouseHandler.processMouseEvent(upEvent);

      expect(result.isDragEnd).toBe(true);
      expect(mouseHandler.isDragging()).toBe(false);
    });

    it('should handle wheel events', () => {
      const wheelEvent: MouseEvent = {
        action: 'wheelup',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const result = mouseHandler.processMouseEvent(wheelEvent);

      expect(result.event).toEqual(wheelEvent);
      expect(mouseHandler.getCurrentPosition().x).toBe(10);
      expect(mouseHandler.getCurrentPosition().y).toBe(20);
    });

    it('should not start drag below threshold', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const moveEvent: MouseEvent = {
        action: 'mousemove',
        x: 11,
        y: 21,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      // Mouse down
      mouseHandler.processMouseEvent(downEvent);

      // Small mouse move (should not start drag)
      const result = mouseHandler.processMouseEvent(moveEvent);

      expect(result.isDragStart).toBe(false);
      expect(mouseHandler.isDragging()).toBe(false);
    });
  });

  describe('Static utility methods', () => {
    it('should check if point is in bounds', () => {
      const point = { x: 15, y: 25 };
      const bounds = { x: 10, y: 20, width: 20, height: 20 };

      const result = MouseHandler.isPointInBounds(point, bounds);

      expect(result).toBe(true);
    });

    it('should check if point is outside bounds', () => {
      const point = { x: 5, y: 15 };
      const bounds = { x: 10, y: 20, width: 20, height: 20 };

      const result = MouseHandler.isPointInBounds(point, bounds);

      expect(result).toBe(false);
    });

    it('should check if mouse event is in bounds', () => {
      const event: MouseEvent = {
        action: 'mousedown',
        x: 15,
        y: 25,
        button: 'left',
        shift: false,
        ctrl: false,
      };
      const bounds = { x: 10, y: 20, width: 20, height: 20 };

      const result = MouseHandler.isMouseEventInBounds(event, bounds);

      expect(result).toBe(true);
    });

    it('should get relative position', () => {
      const point = { x: 15, y: 25 };
      const bounds = { x: 10, y: 20, width: 20, height: 20 };

      const result = MouseHandler.getRelativePosition(point, bounds);

      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it('should create bounds', () => {
      const bounds = MouseHandler.createBounds(10, 20, 100, 200);

      expect(bounds.x).toBe(10);
      expect(bounds.y).toBe(20);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(200);
    });

    it('should expand bounds', () => {
      const originalBounds = { x: 10, y: 20, width: 100, height: 200 };
      const expandedBounds = MouseHandler.expandBounds(originalBounds, 5);

      expect(expandedBounds.x).toBe(5);
      expect(expandedBounds.y).toBe(15);
      expect(expandedBounds.width).toBe(110);
      expect(expandedBounds.height).toBe(210);
    });

    it('should check if bounds intersect', () => {
      const bounds1 = { x: 0, y: 0, width: 20, height: 20 };
      const bounds2 = { x: 10, y: 10, width: 20, height: 20 };

      const result = MouseHandler.boundsIntersect(bounds1, bounds2);

      expect(result).toBe(true);
    });

    it('should check if bounds do not intersect', () => {
      const bounds1 = { x: 0, y: 0, width: 10, height: 10 };
      const bounds2 = { x: 20, y: 20, width: 10, height: 10 };

      const result = MouseHandler.boundsIntersect(bounds1, bounds2);

      expect(result).toBe(false);
    });

    it('should get intersection of bounds', () => {
      const bounds1 = { x: 0, y: 0, width: 20, height: 20 };
      const bounds2 = { x: 10, y: 10, width: 20, height: 20 };

      const intersection = MouseHandler.getIntersection(bounds1, bounds2);

      expect(intersection).not.toBeNull();
      expect(intersection!.x).toBe(10);
      expect(intersection!.y).toBe(10);
      expect(intersection!.width).toBe(10);
      expect(intersection!.height).toBe(10);
    });

    it('should return null for non-intersecting bounds', () => {
      const bounds1 = { x: 0, y: 0, width: 10, height: 10 };
      const bounds2 = { x: 20, y: 20, width: 10, height: 10 };

      const intersection = MouseHandler.getIntersection(bounds1, bounds2);

      expect(intersection).toBeNull();
    });
  });

  describe('State management', () => {
    it('should track current position', () => {
      const event: MouseEvent = {
        action: 'mousemove',
        x: 50,
        y: 75,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      mouseHandler.processMouseEvent(event);

      const position = mouseHandler.getCurrentPosition();
      expect(position.x).toBe(50);
      expect(position.y).toBe(75);
    });

    it('should track pressed buttons', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const rightDownEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'right',
        shift: false,
        ctrl: false,
      };

      mouseHandler.processMouseEvent(downEvent);
      mouseHandler.processMouseEvent(rightDownEvent);

      const pressedButtons = mouseHandler.getPressedButtons();
      expect(pressedButtons).toContain('left');
      expect(pressedButtons).toContain('right');
      expect(mouseHandler.isButtonPressed('left')).toBe(true);
      expect(mouseHandler.isButtonPressed('right')).toBe(true);
      expect(mouseHandler.isButtonPressed('middle')).toBe(false);
    });

    it('should track drag start position', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      mouseHandler.processMouseEvent(downEvent);

      const dragStart = mouseHandler.getDragStart();
      expect(dragStart).toEqual({ x: 10, y: 20 });
    });

    it('should handle hover state', () => {
      mouseHandler.setHover('element-1');
      expect(mouseHandler.getHoveredElement()).toBe('element-1');

      mouseHandler.setHover('element-2');
      expect(mouseHandler.getHoveredElement()).toBe('element-2');

      mouseHandler.clearHover();
      expect(mouseHandler.getHoveredElement()).toBeUndefined();
    });

    it('should reset state', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      mouseHandler.processMouseEvent(downEvent);
      mouseHandler.setHover('element-1');

      mouseHandler.reset();

      expect(mouseHandler.getCurrentPosition()).toEqual({ x: 0, y: 0 });
      expect(mouseHandler.isDragging()).toBe(false);
      expect(mouseHandler.getPressedButtons()).toHaveLength(0);
      expect(mouseHandler.getHoveredElement()).toBeUndefined();
      expect(mouseHandler.getDragStart()).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple buttons pressed simultaneously', () => {
      const leftDown: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const rightDown: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'right',
        shift: false,
        ctrl: false,
      };

      const middleDown: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'middle',
        shift: false,
        ctrl: false,
      };

      mouseHandler.processMouseEvent(leftDown);
      mouseHandler.processMouseEvent(rightDown);
      mouseHandler.processMouseEvent(middleDown);

      expect(mouseHandler.getPressedButtons()).toHaveLength(3);
    });

    it('should handle mouse up without mouse down', () => {
      const upEvent: MouseEvent = {
        action: 'mouseup',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      const result = mouseHandler.processMouseEvent(upEvent);

      expect(result.isDragEnd).toBe(false);
      expect(mouseHandler.isButtonPressed('left')).toBe(false);
    });

    it('should handle negative coordinates', () => {
      const event: MouseEvent = {
        action: 'mousedown',
        x: -10,
        y: -20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      expect(() => mouseHandler.processMouseEvent(event)).not.toThrow();
      expect(mouseHandler.getCurrentPosition()).toEqual({ x: -10, y: -20 });
    });

    it('should handle extreme coordinates', () => {
      const event: MouseEvent = {
        action: 'mousedown',
        x: 99999,
        y: 99999,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      expect(() => mouseHandler.processMouseEvent(event)).not.toThrow();
      expect(mouseHandler.getCurrentPosition()).toEqual({ x: 99999, y: 99999 });
    });

    it('should handle rapid successive events', () => {
      const events: MouseEvent[] = [];
      for (let i = 0; i < 100; i++) {
        events.push({
          action: 'mousemove',
          x: i,
          y: i,
          button: 'left',
          shift: false,
          ctrl: false,
        });
      }

      events.forEach(event => {
        expect(() => mouseHandler.processMouseEvent(event)).not.toThrow();
      });

      expect(mouseHandler.getCurrentPosition()).toEqual({ x: 99, y: 99 });
    });

    it('should handle destroy', () => {
      const downEvent: MouseEvent = {
        action: 'mousedown',
        x: 10,
        y: 20,
        button: 'left',
        shift: false,
        ctrl: false,
      };

      mouseHandler.processMouseEvent(downEvent);
      mouseHandler.setHover('element-1');

      expect(() => mouseHandler.destroy()).not.toThrow();

      // State should be reset after destroy
      expect(mouseHandler.getCurrentPosition()).toEqual({ x: 0, y: 0 });
      expect(mouseHandler.isDragging()).toBe(false);
      expect(mouseHandler.getHoveredElement()).toBeUndefined();
    });
  });
});
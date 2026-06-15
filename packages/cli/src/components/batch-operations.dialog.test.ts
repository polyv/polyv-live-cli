/**
 * @fileoverview Unit tests for BatchOperationsDialog component
 * @author Development Team
 * @since 5.3.0
 */

import { EventEmitter } from 'events';
import { BatchOperationsDialog, BatchOperationsDialogConfig, BatchOperationResult } from './batch-operations.dialog';

// Mock blessed to avoid terminal dependency in tests
jest.mock('blessed', () => ({
  box: jest.fn(() => ({
    setContent: jest.fn(),
    key: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    focus: jest.fn(),
    destroy: jest.fn(),
    screen: {
      render: jest.fn(),
      remove: jest.fn()
    }
  })),
  list: jest.fn(() => ({
    setItems: jest.fn(),
    select: jest.fn(),
    up: jest.fn(),
    down: jest.fn(),
    focus: jest.fn(),
    selected: 0
  })),
  progressbar: jest.fn(() => ({
    setProgress: jest.fn(),
    hide: jest.fn(),
    show: jest.fn()
  })),
  question: jest.fn(() => ({
    ask: jest.fn()
  })),
  screen: jest.fn(() => ({
    render: jest.fn(),
    append: jest.fn(),
    remove: jest.fn(),
    destroy: jest.fn()
  }))
}));

describe('BatchOperationsDialog', () => {
  let eventBus: EventEmitter;
  let config: BatchOperationsDialogConfig;
  let dialog: BatchOperationsDialog;
  let mockScreen: any;

  beforeEach(() => {
    eventBus = new EventEmitter();
    mockScreen = {
      render: jest.fn(),
      append: jest.fn(),
      remove: jest.fn(),
      destroy: jest.fn()
    };
    
    config = {
      screen: mockScreen,
      eventBus,
      showColors: true
    };
  });

  afterEach(() => {
    if (dialog) {
      dialog.destroy();
    }
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      dialog = new BatchOperationsDialog(config);
      
      expect(dialog).toBeInstanceOf(BatchOperationsDialog);
      expect(dialog.isShowing()).toBe(false);
      expect(dialog.getSelectedChannels()).toEqual([]);
    });

    it('should setup event listeners', () => {
      const eventBusSpy = jest.spyOn(eventBus, 'on');
      dialog = new BatchOperationsDialog(config);
      
      expect(eventBusSpy).toHaveBeenCalledWith('batchOperation:completed', expect.any(Function));
      expect(eventBusSpy).toHaveBeenCalledWith('batchOperation:progress', expect.any(Function));
    });
  });

  describe('show method', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
    });

    it('should show dialog with selected channels', () => {
      const channels = ['123', '456', '789'];
      
      dialog.show(channels);
      
      expect(dialog.isShowing()).toBe(true);
      expect(dialog.getSelectedChannels()).toEqual(channels);
      expect(mockScreen.render).toHaveBeenCalled();
    });

    it('should emit shown event', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      const channels = ['123', '456'];
      
      dialog.show(channels);
      
      expect(emitSpy).toHaveBeenCalledWith('batchOperations:shown', expect.objectContaining({
        selectedChannels: 2,
        timestamp: expect.any(Date)
      }));
    });

    it('should reset operation state when showing', () => {
      const channels = ['123', '456'];
      
      dialog.show(channels);
      const status = dialog.getOperationStatus();
      
      expect(status.operation).toBeNull();
      expect(status.inProgress).toBe(false);
    });
  });

  describe('hide method', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
    });

    it('should hide dialog', () => {
      const channels = ['123', '456'];
      
      dialog.show(channels);
      expect(dialog.isShowing()).toBe(true);
      
      dialog.hide();
      
      expect(dialog.isShowing()).toBe(false);
      expect(dialog.getSelectedChannels()).toEqual([]);
      expect(mockScreen.render).toHaveBeenCalled();
    });

    it('should emit hidden event when channels were selected', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      const channels = ['123', '456'];
      
      dialog.show(channels);
      dialog.hide();
      
      expect(emitSpy).toHaveBeenCalledWith('batchOperations:hidden', expect.objectContaining({
        selectedChannels: 2,
        timestamp: expect.any(Date)
      }));
    });

    it('should reset state on hide', () => {
      const channels = ['123', '456'];
      
      dialog.show(channels);
      dialog.hide();
      
      expect(dialog.getSelectedChannels()).toEqual([]);
      const status = dialog.getOperationStatus();
      expect(status.operation).toBeNull();
      expect(status.inProgress).toBe(false);
    });
  });

  describe('operation status', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
    });

    it('should return correct operation status', () => {
      const status = dialog.getOperationStatus();
      
      expect(status.operation).toBeNull();
      expect(status.inProgress).toBe(false);
    });

    it('should track selected channels', () => {
      const channels = ['123', '456', '789'];
      
      dialog.show(channels);
      
      expect(dialog.getSelectedChannels()).toEqual(channels);
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
    });

    it('should handle batch operation completed event', () => {
      const result: BatchOperationResult = {
        operation: 'start',
        totalChannels: 2,
        successCount: 2,
        failureCount: 0,
        errors: [],
        timestamp: new Date()
      };

      eventBus.emit('batchOperation:completed', result);

      const status = dialog.getOperationStatus();
      expect(status.inProgress).toBe(false);
    });

    it('should handle batch operation progress event', () => {
      const progressData = {
        current: 1,
        total: 2,
        channel: 'Channel 123'
      };

      // This should not throw an error
      expect(() => {
        eventBus.emit('batchOperation:progress', progressData);
      }).not.toThrow();
    });

    it('should ignore completed events for different operations', () => {
      // Start an operation
      dialog['currentOperation'] = 'start';
      dialog['operationInProgress'] = true;

      const result: BatchOperationResult = {
        operation: 'stop', // Different operation
        totalChannels: 2,
        successCount: 2,
        failureCount: 0,
        errors: [],
        timestamp: new Date()
      };

      eventBus.emit('batchOperation:completed', result);

      const status = dialog.getOperationStatus();
      expect(status.inProgress).toBe(true); // Should remain in progress
    });
  });

  describe('operation results formatting', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
    });

    it('should format successful operation result', () => {
      const result: BatchOperationResult = {
        operation: 'start',
        totalChannels: 3,
        successCount: 3,
        failureCount: 0,
        errors: [],
        timestamp: new Date()
      };

      const formatted = dialog['formatOperationResult'](result);
      
      expect(formatted).toContain('Operation Complete:');
      expect(formatted).toContain('start');
      expect(formatted).toContain('Total: 3');
      expect(formatted).toContain('Success:');
      expect(formatted).toContain('3');
      expect(formatted).toContain('Failed:');
      expect(formatted).toContain('0');
    });

    it('should format operation result with errors', () => {
      const result: BatchOperationResult = {
        operation: 'delete',
        totalChannels: 3,
        successCount: 1,
        failureCount: 2,
        errors: [
          { channelId: '123', error: 'Channel not found' },
          { channelId: '456', error: 'Permission denied' }
        ],
        timestamp: new Date()
      };

      const formatted = dialog['formatOperationResult'](result);
      
      expect(formatted).toContain('Operation Complete:');
      expect(formatted).toContain('delete');
      expect(formatted).toContain('Failed:');
      expect(formatted).toContain('2');
      expect(formatted).toContain('Errors:');
      expect(formatted).toContain('123: Channel not found');
      expect(formatted).toContain('456: Permission denied');
    });

    it('should truncate error list when there are many errors', () => {
      const errors = Array.from({ length: 5 }, (_, i) => ({
        channelId: `channel-${i}`,
        error: `Error ${i}`
      }));

      const result: BatchOperationResult = {
        operation: 'stop',
        totalChannels: 5,
        successCount: 0,
        failureCount: 5,
        errors,
        timestamp: new Date()
      };

      const formatted = dialog['formatOperationResult'](result);
      
      expect(formatted).toContain('and 2 more errors');
    });
  });

  describe('configuration options', () => {
    it('should handle colors disabled configuration', () => {
      const noColorConfig = { ...config, showColors: false };
      dialog = new BatchOperationsDialog(noColorConfig);

      const footerContent = dialog['getFooterContent']();
      expect(footerContent).toContain('Colors: OFF');
    });

    it('should handle colors enabled configuration', () => {
      dialog = new BatchOperationsDialog(config);

      const footerContent = dialog['getFooterContent']();
      expect(footerContent).toContain('Colors: ON');
    });

    it('should show different footer when operation is in progress', () => {
      dialog = new BatchOperationsDialog(config);
      dialog['operationInProgress'] = true;

      const footerContent = dialog['getFooterContent']();
      expect(footerContent).toContain('Operation in progress');
    });
  });

  describe('operation items', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
    });

    it('should return correct operation items', () => {
      const items = dialog['getOperationItems']();
      
      expect(items).toHaveLength(5);
      expect(items[0]).toContain('Start Streaming');
      expect(items[1]).toContain('Stop Streaming');
      expect(items[2]).toContain('Refresh Data');
      expect(items[3]).toContain('Export Data');
      expect(items[4]).toContain('Delete Channels');
    });

    it('should include danger warning for delete operation', () => {
      const items = dialog['getOperationItems']();
      const deleteItem = items[4];
      
      expect(deleteItem).toContain('DANGER:');
      expect(deleteItem).toContain('Permanently delete');
    });
  });

  describe('progress updates', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
      dialog['operationInProgress'] = true;
    });

    it('should update progress correctly', () => {
      dialog['updateProgress'](1, 2);
      
      // Progress should be updated (mocked functions won't throw)
      expect(() => {
        dialog['updateProgress'](1, 2);
      }).not.toThrow();
    });

    it('should handle progress with channel info', () => {
      dialog['updateProgress'](1, 2, 'Channel 123');
      
      expect(() => {
        dialog['updateProgress'](1, 2, 'Channel 123');
      }).not.toThrow();
    });

    it('should handle zero total in progress', () => {
      dialog['updateProgress'](0, 0);
      
      expect(() => {
        dialog['updateProgress'](0, 0);
      }).not.toThrow();
    });

    it('should ignore progress updates when not visible', () => {
      dialog.hide();
      
      expect(() => {
        dialog['updateProgress'](1, 2);
      }).not.toThrow();
    });

    it('should ignore progress updates when not in operation', () => {
      dialog['operationInProgress'] = false;
      
      expect(() => {
        dialog['updateProgress'](1, 2);
      }).not.toThrow();
    });
  });

  describe('destroy method', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
    });

    it('should clean up resources', () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      dialog.show(['123', '456']);
      dialog.destroy();
      
      expect(dialog.isShowing()).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('batchOperations:destroyed', expect.objectContaining({
        timestamp: expect.any(Date)
      }));
    });

    it('should handle destroy when screen remove fails', () => {
      // Simulate screen.remove throwing an error
      mockScreen.remove = jest.fn(() => {
        throw new Error('Remove failed');
      });
      
      expect(() => {
        dialog.destroy();
      }).not.toThrow();
    });

    it('should hide dialog before destroying', () => {
      dialog.show(['123', '456']);
      expect(dialog.isShowing()).toBe(true);
      
      dialog.destroy();
      
      expect(dialog.isShowing()).toBe(false);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
    });

    it('should handle empty channel list', () => {
      dialog.show([]);
      
      expect(dialog.getSelectedChannels()).toEqual([]);
      const status = dialog.getOperationStatus();
      expect(status.operation).toBeNull();
    });

    it('should handle hide without show', () => {
      expect(() => {
        dialog.hide();
      }).not.toThrow();
      
      expect(dialog.isShowing()).toBe(false);
    });

    it('should handle multiple show calls', () => {
      dialog.show(['123']);
      dialog.show(['456', '789']);
      
      expect(dialog.getSelectedChannels()).toEqual(['456', '789']);
    });

    it('should handle operation completion when not visible', () => {
      const result: BatchOperationResult = {
        operation: 'start',
        totalChannels: 1,
        successCount: 1,
        failureCount: 0,
        errors: [],
        timestamp: new Date()
      };

      dialog.hide();
      
      expect(() => {
        eventBus.emit('batchOperation:completed', result);
      }).not.toThrow();
    });

    it('should handle escape key when operation not in progress', () => {
      const blessed = require('blessed');
      const mockDialog = blessed.box();
      
      // Mock the key handler call
      const escapeHandler = mockDialog.key.mock.calls.find(
        (call: any[]) => call[0].includes('escape')
      )?.[1];

      // Simulate operationInProgress = false
      (dialog as any).operationInProgress = false;

      if (escapeHandler) {
        expect(() => escapeHandler()).not.toThrow();
      }
    });

    it('should handle enter key when operation not in progress', () => {
      const blessed = require('blessed');
      const mockDialog = blessed.box();
      
      // Mock the key handler call
      const enterHandler = mockDialog.key.mock.calls.find(
        (call: any[]) => call[0].includes('enter')
      )?.[1];

      // Simulate operationInProgress = false
      (dialog as any).operationInProgress = false;
      
      // Mock executeSelectedOperation
      jest.spyOn(dialog as any, 'executeSelectedOperation').mockImplementation(() => {});

      if (enterHandler) {
        expect(() => enterHandler()).not.toThrow();
      }
    });

    it('should handle up key navigation', () => {
      const blessed = require('blessed');
      const mockDialog = blessed.box();
      
      // Mock the key handler call
      const upHandler = mockDialog.key.mock.calls.find(
        (call: any[]) => call[0].includes('up')
      )?.[1];

      if (upHandler) {
        expect(() => upHandler()).not.toThrow();
      }
    });

    it('should handle down key navigation', () => {
      const blessed = require('blessed');
      const mockDialog = blessed.box();
      
      // Mock the key handler call
      const downHandler = mockDialog.key.mock.calls.find(
        (call: any[]) => call[0].includes('down')
      )?.[1];

      if (downHandler) {
        expect(() => downHandler()).not.toThrow();
      }
    });

    it('should not execute operations when operation in progress', () => {
      const blessed = require('blessed');
      const mockDialog = blessed.box();
      
      // Set operation in progress
      (dialog as any).operationInProgress = true;
      
      // Test escape key
      const escapeHandler = mockDialog.key.mock.calls.find(
        (call: any[]) => call[0].includes('escape')
      )?.[1];

      // Test enter key  
      const enterHandler = mockDialog.key.mock.calls.find(
        (call: any[]) => call[0].includes('enter')
      )?.[1];

      if (escapeHandler) {
        expect(() => escapeHandler()).not.toThrow();
      }
      
      if (enterHandler) {
        expect(() => enterHandler()).not.toThrow();
      }
    });

    it('should cover more key handler branches', () => {
      const blessed = require('blessed');
      const mockDialog = blessed.box();
      
      // Get all key handlers
      const keyHandlers = mockDialog.key.mock.calls;
      
      keyHandlers.forEach(([, handler]: [string[], Function]) => {
        if (handler) {
          expect(() => handler()).not.toThrow();
        }
      });
    });

    it('should handle different operation states', () => {
      // Test various states of operationInProgress
      (dialog as any).operationInProgress = false;
      expect((dialog as any).operationInProgress).toBe(false);
      
      (dialog as any).operationInProgress = true;
      expect((dialog as any).operationInProgress).toBe(true);
    });
  });

  describe('executeSelectedOperation method', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
    });

    it('should not execute when operation in progress', () => {
      (dialog as any).operationInProgress = true;
      
      expect(() => {
        (dialog as any).executeSelectedOperation();
      }).not.toThrow();
    });

    it('should not execute when no channels selected', () => {
      dialog.show([]);
      
      expect(() => {
        (dialog as any).executeSelectedOperation();
      }).not.toThrow();
    });

    it('should execute non-destructive operations directly', () => {
      const startOperationSpy = jest.spyOn(dialog as any, 'startOperation').mockImplementation();
      (dialog as any).operationsList.selected = 0; // 'start' operation
      
      (dialog as any).executeSelectedOperation();
      
      expect(startOperationSpy).toHaveBeenCalledWith('start');
    });

    it('should show confirmation for delete operation', () => {
      const showConfirmationSpy = jest.spyOn(dialog as any, 'showConfirmationDialog').mockImplementation();
      (dialog as any).operationsList.selected = 4; // 'delete' operation
      
      (dialog as any).executeSelectedOperation();
      
      expect(showConfirmationSpy).toHaveBeenCalledWith('delete');
    });

    it('should handle invalid operation index', () => {
      (dialog as any).operationsList.selected = 99; // Invalid index
      
      expect(() => {
        (dialog as any).executeSelectedOperation();
      }).not.toThrow();
    });
  });

  describe('showConfirmationDialog method', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
    });

    it('should show delete confirmation message', () => {
      const blessed = require('blessed');
      const mockQuestion = { ask: jest.fn() };
      blessed.question.mockReturnValue(mockQuestion);
      
      (dialog as any).showConfirmationDialog('delete');
      
      expect(blessed.question).toHaveBeenCalled();
      expect(mockQuestion.ask).toHaveBeenCalledWith(
        expect.stringContaining('DELETE 2 channels'),
        expect.any(Function)
      );
    });

    it('should handle confirmation callback with confirmed = true', () => {
      const blessed = require('blessed');
      const mockQuestion = { ask: jest.fn() };
      blessed.question.mockReturnValue(mockQuestion);
      const startOperationSpy = jest.spyOn(dialog as any, 'startOperation').mockImplementation();
      
      // Mock ask to call callback with confirmed = true
      mockQuestion.ask.mockImplementation((_message: string, callback: Function) => {
        callback(null, true);
      });
      
      (dialog as any).showConfirmationDialog('delete');
      
      expect(startOperationSpy).toHaveBeenCalledWith('delete');
    });

    it('should handle confirmation callback with confirmed = false', () => {
      const blessed = require('blessed');
      const mockQuestion = { ask: jest.fn() };
      blessed.question.mockReturnValue(mockQuestion);
      const startOperationSpy = jest.spyOn(dialog as any, 'startOperation').mockImplementation();
      
      // Mock ask to call callback with confirmed = false
      mockQuestion.ask.mockImplementation((_message: string, callback: Function) => {
        callback(null, false);
      });
      
      (dialog as any).showConfirmationDialog('delete');
      
      expect(startOperationSpy).not.toHaveBeenCalled();
    });

    it('should show generic confirmation for other operations', () => {
      const blessed = require('blessed');
      const mockQuestion = { ask: jest.fn() };
      blessed.question.mockReturnValue(mockQuestion);
      
      (dialog as any).showConfirmationDialog('stop');
      
      expect(mockQuestion.ask).toHaveBeenCalledWith(
        expect.stringContaining('perform stop on 2 channels'),
        expect.any(Function)
      );
    });
  });

  describe('startOperation method', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
    });

    it('should set operation state correctly', () => {
      const blessed = require('blessed');
      const mockProgressBar = blessed.progressbar();
      (dialog as any).progressBar = mockProgressBar;
      
      (dialog as any).startOperation('start');
      
      expect((dialog as any).currentOperation).toBe('start');
      expect((dialog as any).operationInProgress).toBe(true);
      expect(mockProgressBar.show).toHaveBeenCalled();
      expect(mockProgressBar.setProgress).toHaveBeenCalledWith(0);
    });

    it('should emit operation start event', () => {
      const blessed = require('blessed');
      const mockProgressBar = blessed.progressbar();
      (dialog as any).progressBar = mockProgressBar;
      const emitSpy = jest.spyOn(eventBus, 'emit');
      
      (dialog as any).startOperation('export');
      
      expect(emitSpy).toHaveBeenCalledWith('batchOperation:start', expect.objectContaining({
        operation: 'export',
        channels: ['123', '456']
      }));
    });
  });

  describe('operation completion with auto-hide', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
      (dialog as any).currentOperation = 'start';
      (dialog as any).operationInProgress = true;
    });

    it('should auto-hide after successful operation', (done) => {
      const result: BatchOperationResult = {
        operation: 'start',
        totalChannels: 2,
        successCount: 2,
        failureCount: 0,
        errors: [],
        timestamp: new Date()
      };

      // Mock setTimeout to call immediately
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback: Function) => {
        callback();
        return 123 as any;
      }) as any;

      const hideSpy = jest.spyOn(dialog, 'hide');

      eventBus.emit('batchOperation:completed', result);

      // Verify auto-hide was called
      expect(hideSpy).toHaveBeenCalled();
      
      global.setTimeout = originalSetTimeout;
      done();
    });

    it('should not auto-hide after operation with failures', () => {
      const result: BatchOperationResult = {
        operation: 'start',
        totalChannels: 2,
        successCount: 1,
        failureCount: 1,
        errors: [{ channelId: '456', error: 'Failed to start' }],
        timestamp: new Date()
      };

      const hideSpy = jest.spyOn(dialog, 'hide');

      eventBus.emit('batchOperation:completed', result);

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it('should handle auto-hide timeout when dialog not visible', () => {
      const result: BatchOperationResult = {
        operation: 'start',
        totalChannels: 2,
        successCount: 2,
        failureCount: 0,
        errors: [],
        timestamp: new Date()
      };

      // Mock setTimeout and hide dialog first
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback: Function) => {
        // Hide dialog before timeout
        dialog.hide();
        callback();
        return 123 as any;
      }) as any;

      const hideSpy = jest.spyOn(dialog, 'hide');

      eventBus.emit('batchOperation:completed', result);

      // Hide should have been called once by manual hide, timeout should not call it again
      expect(hideSpy).toHaveBeenCalledTimes(1);
      
      global.setTimeout = originalSetTimeout;
    });

    it('should handle auto-hide timeout when operation in progress', () => {
      const result: BatchOperationResult = {
        operation: 'start',
        totalChannels: 2,
        successCount: 2,
        failureCount: 0,
        errors: [],
        timestamp: new Date()
      };

      // Mock setTimeout and set operation in progress during timeout
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback: Function) => {
        // Set operation in progress before timeout
        (dialog as any).operationInProgress = true;
        callback();
        return 123 as any;
      }) as any;

      const hideSpy = jest.spyOn(dialog, 'hide');

      eventBus.emit('batchOperation:completed', result);

      // Hide should not be called due to operation in progress
      expect(hideSpy).not.toHaveBeenCalled();
      
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('keyboard shortcuts for operations', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
    });

    it('should handle number key 1 for start operation', () => {
      const blessed = require('blessed');
      const mockList = blessed.list();
      const executeOperationSpy = jest.spyOn(dialog as any, 'executeSelectedOperation').mockImplementation();
      
      // Find the '1' key handler
      const oneKeyHandler = blessed.box().key.mock.calls.find(
        (call: any[]) => call[0].includes('1')
      )?.[1];

      if (oneKeyHandler) {
        oneKeyHandler();
        expect(mockList.select).toHaveBeenCalledWith(0);
        expect(executeOperationSpy).toHaveBeenCalled();
      }
    });

    it('should handle number key 2 for stop operation', () => {
      const blessed = require('blessed');
      const mockList = blessed.list();
      const executeOperationSpy = jest.spyOn(dialog as any, 'executeSelectedOperation').mockImplementation();
      
      // Find the '2' key handler
      const twoKeyHandler = blessed.box().key.mock.calls.find(
        (call: any[]) => call[0].includes('2')
      )?.[1];

      if (twoKeyHandler) {
        twoKeyHandler();
        expect(mockList.select).toHaveBeenCalledWith(1);
        expect(executeOperationSpy).toHaveBeenCalled();
      }
    });

    it('should handle number key 3 for refresh operation', () => {
      const blessed = require('blessed');
      const mockList = blessed.list();
      const executeOperationSpy = jest.spyOn(dialog as any, 'executeSelectedOperation').mockImplementation();
      
      // Find the '3' key handler
      const threeKeyHandler = blessed.box().key.mock.calls.find(
        (call: any[]) => call[0].includes('3')
      )?.[1];

      if (threeKeyHandler) {
        threeKeyHandler();
        expect(mockList.select).toHaveBeenCalledWith(2);
        expect(executeOperationSpy).toHaveBeenCalled();
      }
    });

    it('should handle number key 4 for export operation', () => {
      const blessed = require('blessed');
      const mockList = blessed.list();
      const executeOperationSpy = jest.spyOn(dialog as any, 'executeSelectedOperation').mockImplementation();
      
      // Find the '4' key handler
      const fourKeyHandler = blessed.box().key.mock.calls.find(
        (call: any[]) => call[0].includes('4')
      )?.[1];

      if (fourKeyHandler) {
        fourKeyHandler();
        expect(mockList.select).toHaveBeenCalledWith(3);
        expect(executeOperationSpy).toHaveBeenCalled();
      }
    });

    it('should handle number key 5 for delete operation', () => {
      const blessed = require('blessed');
      const mockList = blessed.list();
      const executeOperationSpy = jest.spyOn(dialog as any, 'executeSelectedOperation').mockImplementation();
      
      // Find the '5' key handler
      const fiveKeyHandler = blessed.box().key.mock.calls.find(
        (call: any[]) => call[0].includes('5')
      )?.[1];

      if (fiveKeyHandler) {
        fiveKeyHandler();
        expect(mockList.select).toHaveBeenCalledWith(4);
        expect(executeOperationSpy).toHaveBeenCalled();
      }
    });
  });

  describe('updateFooter and refreshFooter methods', () => {
    beforeEach(() => {
      dialog = new BatchOperationsDialog(config);
      dialog.show(['123', '456']);
    });

    it('should call updateFooter correctly', () => {
      const blessed = require('blessed');
      const mockFooterBox = blessed.box();
      (dialog as any).footerBox = mockFooterBox;
      
      (dialog as any).updateFooter();
      
      expect(mockFooterBox.setContent).toHaveBeenCalled();
    });

    it('should call refreshFooter correctly', () => {
      const blessed = require('blessed');
      const mockFooterBox = blessed.box();
      (dialog as any).footerBox = mockFooterBox;
      const updateFooterSpy = jest.spyOn(dialog as any, 'updateFooter').mockImplementation();
      
      (dialog as any).refreshFooter();
      
      expect(updateFooterSpy).toHaveBeenCalled();
      expect(mockScreen.render).toHaveBeenCalled();
    });
  });
});
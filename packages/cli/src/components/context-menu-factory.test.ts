/**
 * @fileoverview Unit tests for ContextMenuFactory
 * @author Development Team
 * @since 1.0.0
 */

import { ContextMenuFactory } from './context-menu-factory';
import { ContextMenuItem } from './context-menu';

describe('ContextMenuFactory', () => {
  describe('generateMenuItems method', () => {
    describe('channel-status component', () => {
      it('should generate menu for live channel', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'channel-status',
          'channel-123',
          {
            status: 'live',
            channelData: { id: 'channel-123' },
          }
        );

        expect(items).toHaveLength(7);
        expect(items.find(item => item.action === 'channel:view-details')).toBeDefined();
        expect(items.find(item => item.action === 'channel:stop-stream')).toBeDefined();
        expect(items.find(item => item.action === 'channel:start-stream')).toBeUndefined();
      });

      it('should generate menu for offline channel', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'channel-status',
          'channel-456',
          {
            status: 'offline',
            channelData: { id: 'channel-456' },
          }
        );

        expect(items).toHaveLength(6);
        expect(items.find(item => item.action === 'channel:start-stream')).toBeDefined();
        expect(items.find(item => item.action === 'channel:stop-stream')).toBeUndefined();
      });

      it('should disable actions when no channel data', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'channel-status',
          'channel-789',
          {
            status: 'unknown',
          }
        );

        const viewDetailsItem = items.find(item => item.action === 'channel:view-details');
        const startStreamItem = items.find(item => item.action === 'channel:start-stream');
        
        expect(viewDetailsItem?.enabled).toBe(false);
        expect(startStreamItem?.enabled).toBe(false);
      });

      it('should disable delete action for live channels', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'channel-status',
          'channel-live',
          {
            status: 'live',
            channelData: { id: 'channel-live' },
          }
        );

        const deleteItem = items.find(item => item.action === 'channel:delete');
        expect(deleteItem?.enabled).toBe(false);
      });

      it('should enable delete action for offline channels', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'channel-status',
          'channel-offline',
          {
            status: 'offline',
            channelData: { id: 'channel-offline' },
          }
        );

        const deleteItem = items.find(item => item.action === 'channel:delete');
        expect(deleteItem?.enabled).not.toBe(false);
      });

      it('should include required menu items with correct properties', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'channel-status',
          'channel-test',
          { channelData: { id: 'test' } }
        );

        const viewDetailsItem = items.find(item => item.action === 'channel:view-details');
        expect(viewDetailsItem).toMatchObject({
          label: 'View Details',
          action: 'channel:view-details',
          icon: '📋',
          shortcut: 'Enter',
        });

        const refreshItem = items.find(item => item.action === 'channel:refresh');
        expect(refreshItem).toMatchObject({
          label: 'Refresh Data',
          action: 'channel:refresh',
          icon: '🔄',
          shortcut: 'F5',
        });
      });
    });

    describe('system-resource component', () => {
      it('should generate system resource menu items', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'system-resource',
          'sys-resource-1'
        );

        expect(items).toHaveLength(6);
        expect(items.find(item => item.action === 'system:refresh')).toBeDefined();
        expect(items.find(item => item.action === 'system:view-history')).toBeDefined();
        expect(items.find(item => item.action === 'system:configure-alerts')).toBeDefined();
        expect(items.find(item => item.action === 'system:export')).toBeDefined();
        expect(items.find(item => item.action === 'system:reset')).toBeDefined();
        expect(items.find(item => item.action === 'system:settings')).toBeDefined();
      });

      it('should include correct icons and shortcuts', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'system-resource',
          'sys-resource-1'
        );

        const refreshItem = items.find(item => item.action === 'system:refresh');
        expect(refreshItem).toMatchObject({
          label: 'Refresh Metrics',
          action: 'system:refresh',
          icon: '🔄',
          shortcut: 'F5',
        });

        const historyItem = items.find(item => item.action === 'system:view-history');
        expect(historyItem).toMatchObject({
          label: 'View History',
          action: 'system:view-history',
          icon: '📈',
          shortcut: 'H',
        });
      });
    });

    describe('stream-metrics component', () => {
      it('should generate stream metrics menu items', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'stream-metrics',
          'metrics-1'
        );

        expect(items).toHaveLength(6);
        expect(items.find(item => item.action === 'metrics:refresh')).toBeDefined();
        expect(items.find(item => item.action === 'metrics:view-details')).toBeDefined();
        expect(items.find(item => item.action === 'metrics:reset')).toBeDefined();
        expect(items.find(item => item.action === 'metrics:export')).toBeDefined();
        expect(items.find(item => item.action === 'metrics:configure')).toBeDefined();
        expect(items.find(item => item.action === 'metrics:fullscreen')).toBeDefined();
      });

      it('should include correct shortcuts for metrics actions', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'stream-metrics',
          'metrics-1'
        );

        const detailsItem = items.find(item => item.action === 'metrics:view-details');
        expect(detailsItem?.shortcut).toBe('Enter');

        const fullscreenItem = items.find(item => item.action === 'metrics:fullscreen');
        expect(fullscreenItem?.shortcut).toBe('F11');
      });
    });

    describe('help-panel component', () => {
      it('should generate help panel menu items', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'help-panel',
          'help-1'
        );

        expect(items).toHaveLength(3);
        expect(items.find(item => item.action === 'help:close')).toBeDefined();
        expect(items.find(item => item.action === 'help:print')).toBeDefined();
        expect(items.find(item => item.action === 'help:about')).toBeDefined();
      });

      it('should include correct shortcuts for help actions', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'help-panel',
          'help-1'
        );

        const closeItem = items.find(item => item.action === 'help:close');
        expect(closeItem?.shortcut).toBe('Esc');

        const printItem = items.find(item => item.action === 'help:print');
        expect(printItem?.shortcut).toBe('Ctrl+P');
      });
    });

    describe('monitoring-dashboard component', () => {
      it('should generate dashboard menu items', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'monitoring-dashboard',
          'dashboard-1'
        );

        expect(items).toHaveLength(6);
        expect(items.find(item => item.action === 'dashboard:refresh-all')).toBeDefined();
        expect(items.find(item => item.action === 'dashboard:clear')).toBeDefined();
        expect(items.find(item => item.action === 'dashboard:switch-layout')).toBeDefined();
        expect(items.find(item => item.action === 'dashboard:settings')).toBeDefined();
        expect(items.find(item => item.action === 'dashboard:help')).toBeDefined();
        expect(items.find(item => item.action === 'dashboard:exit')).toBeDefined();
      });

      it('should include submenu for layout switching', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'monitoring-dashboard',
          'dashboard-1'
        );

        const layoutItem = items.find(item => item.action === 'dashboard:switch-layout');
        expect(layoutItem?.submenu).toBeDefined();
        expect(layoutItem?.submenu).toHaveLength(3);
        
        const compactLayout = layoutItem?.submenu?.find(item => item.action === 'layout:compact');
        expect(compactLayout).toMatchObject({
          label: 'Compact Layout',
          action: 'layout:compact',
          shortcut: '1',
        });
      });
    });

    describe('unknown component types', () => {
      it('should generate generic menu for unknown component types', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'unknown-component',
          'unknown-1'
        );

        expect(items).toHaveLength(5);
        expect(items.find(item => item.action === 'component:focus')).toBeDefined();
        expect(items.find(item => item.action === 'component:refresh')).toBeDefined();
        expect(items.find(item => item.action === 'component:properties')).toBeDefined();
        expect(items.find(item => item.action === 'component:fullscreen')).toBeDefined();
        expect(items.find(item => item.action === 'component:help')).toBeDefined();
      });

      it('should include standard shortcuts for generic actions', () => {
        const items = ContextMenuFactory.generateMenuItems(
          'custom-component',
          'custom-1'
        );

        const focusItem = items.find(item => item.action === 'component:focus');
        expect(focusItem?.shortcut).toBe('Tab');

        const helpItem = items.find(item => item.action === 'component:help');
        expect(helpItem?.shortcut).toBe('F1');
      });
    });
  });

  describe('filterMenuItems method', () => {
    const sampleItems: ContextMenuItem[] = [
      {
        label: 'Enabled Item',
        action: 'enabled-action',
        enabled: true,
      },
      {
        label: 'Disabled Item',
        action: 'disabled-action',
        enabled: false,
      },
      {
        label: 'Default Item',
        action: 'default-action',
        // enabled is undefined, should default to true
      },
    ];

    it('should filter out disabled items', () => {
      const filtered = ContextMenuFactory.filterMenuItems(sampleItems);

      expect(filtered).toHaveLength(2);
      expect(filtered.find(item => item.action === 'enabled-action')).toBeDefined();
      expect(filtered.find(item => item.action === 'default-action')).toBeDefined();
      expect(filtered.find(item => item.action === 'disabled-action')).toBeUndefined();
    });

    it('should include items with enabled=true', () => {
      const filtered = ContextMenuFactory.filterMenuItems(sampleItems);

      const enabledItem = filtered.find(item => item.action === 'enabled-action');
      expect(enabledItem).toBeDefined();
    });

    it('should include items without enabled property (default to enabled)', () => {
      const filtered = ContextMenuFactory.filterMenuItems(sampleItems);

      const defaultItem = filtered.find(item => item.action === 'default-action');
      expect(defaultItem).toBeDefined();
    });

    it('should handle empty array', () => {
      const filtered = ContextMenuFactory.filterMenuItems([]);

      expect(filtered).toHaveLength(0);
    });

    it('should not modify original array', () => {
      const originalLength = sampleItems.length;
      ContextMenuFactory.filterMenuItems(sampleItems);

      expect(sampleItems).toHaveLength(originalLength);
    });

    it('should work with context parameter', () => {
      const context = { someProperty: 'value' };
      const filtered = ContextMenuFactory.filterMenuItems(sampleItems, context);

      expect(filtered).toHaveLength(2);
    });
  });

  describe('addShortcutsToMenuItems method', () => {
    const sampleItems: ContextMenuItem[] = [
      {
        label: 'Refresh',
        action: 'refresh',
      },
      {
        label: 'Help',
        action: 'help',
        shortcut: 'F1', // Already has shortcut
      },
      {
        label: 'Unknown Action',
        action: 'unknown',
      },
    ];

    it('should add shortcuts from shortcut map', () => {
      const shortcuts = new Map([
        ['f5', { action: 'refresh', description: 'Refresh data' }],
        ['ctrl+h', { action: 'help', description: 'Show help' }],
      ]);

      const enhanced = ContextMenuFactory.addShortcutsToMenuItems(sampleItems, shortcuts);

      const refreshItem = enhanced.find(item => item.action === 'refresh');
      expect(refreshItem?.shortcut).toBe('F5');
    });

    it('should preserve existing shortcuts', () => {
      const shortcuts = new Map([
        ['f1', { action: 'help', description: 'Show help' }],
      ]);

      const enhanced = ContextMenuFactory.addShortcutsToMenuItems(sampleItems, shortcuts);

      const helpItem = enhanced.find(item => item.action === 'help');
      expect(helpItem?.shortcut).toBe('F1'); // Should keep original
    });

    it('should leave items unchanged if no matching shortcut found', () => {
      const shortcuts = new Map([
        ['f10', { action: 'some-other-action', description: 'Other action' }],
      ]);

      const enhanced = ContextMenuFactory.addShortcutsToMenuItems(sampleItems, shortcuts);

      const unknownItem = enhanced.find(item => item.action === 'unknown');
      expect(unknownItem?.shortcut).toBeUndefined();
    });

    it('should handle empty shortcuts map', () => {
      const shortcuts = new Map();

      const enhanced = ContextMenuFactory.addShortcutsToMenuItems(sampleItems, shortcuts);

      expect(enhanced).toHaveLength(sampleItems.length);
      const refreshItem = enhanced.find(item => item.action === 'refresh');
      expect(refreshItem?.shortcut).toBeUndefined();
    });

    it('should handle empty items array', () => {
      const shortcuts = new Map([
        ['f5', { action: 'refresh', description: 'Refresh' }],
      ]);

      const enhanced = ContextMenuFactory.addShortcutsToMenuItems([], shortcuts);

      expect(enhanced).toHaveLength(0);
    });

    it('should convert shortcut keys to uppercase', () => {
      const shortcuts = new Map([
        ['ctrl+r', { action: 'refresh', description: 'Refresh' }],
      ]);

      const enhanced = ContextMenuFactory.addShortcutsToMenuItems(sampleItems, shortcuts);

      const refreshItem = enhanced.find(item => item.action === 'refresh');
      expect(refreshItem?.shortcut).toBe('CTRL+R');
    });

    it('should not modify original items array', () => {
      const shortcuts = new Map([
        ['f5', { action: 'refresh', description: 'Refresh' }],
      ]);

      const originalItems = [...sampleItems];
      const enhanced = ContextMenuFactory.addShortcutsToMenuItems(sampleItems, shortcuts);

      expect(sampleItems).toEqual(originalItems);
      expect(enhanced).not.toBe(sampleItems);
    });
  });

  describe('integration scenarios', () => {
    it('should work with full workflow: generate -> filter -> enhance', () => {
      // Generate menu items
      const items = ContextMenuFactory.generateMenuItems(
        'channel-status',
        'channel-123',
        {
          status: 'offline',
          channelData: { id: 'channel-123' },
        }
      );

      // Filter items
      const filtered = ContextMenuFactory.filterMenuItems(items);

      // Add shortcuts
      const shortcuts = new Map([
        ['enter', { action: 'channel:view-details', description: 'View details' }],
        ['f5', { action: 'channel:refresh', description: 'Refresh' }],
      ]);
      const enhanced = ContextMenuFactory.addShortcutsToMenuItems(filtered, shortcuts);

      expect(enhanced.length).toBeGreaterThan(0);
      
      const viewItem = enhanced.find(item => item.action === 'channel:view-details');
      expect(viewItem?.shortcut).toBe('Enter'); // Should keep original, not ENTER
      
      const refreshItem = enhanced.find(item => item.action === 'channel:refresh');
      expect(refreshItem?.shortcut).toBe('F5'); // Should keep original, not F5
    });

    it('should handle edge case with all items disabled', () => {
      const items = ContextMenuFactory.generateMenuItems(
        'channel-status',
        'channel-no-data',
        {} // No channel data, should disable most actions
      );

      const filtered = ContextMenuFactory.filterMenuItems(items);

      // Should still have some items (like refresh) that don't depend on channel data
      expect(filtered.length).toBeGreaterThan(0);
    });
  });
});
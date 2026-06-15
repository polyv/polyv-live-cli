import blessed from 'blessed';
import { EventEmitter } from 'events';
import { BaseComponent } from './base.component';
import { ComponentConfig } from '../types/monitoring';

export class StatusComponent extends BaseComponent {
  private statusBox: any;

  constructor(config: ComponentConfig, eventBus: EventEmitter) {
    super(config, eventBus);
  }

  protected createWidget(): void {
    this.statusBox = blessed.box({
      top: this.config.position.y,
      left: this.config.position.x,
      width: this.config.position.width,
      height: this.config.position.height,
      content: 'PolyV Monitoring Dashboard\nStatus: Starting...',
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'cyan',
        },
      },
      label: ' Status ',
    });

    this.widget = this.statusBox;
  }

  public render(): void {
    if (this.isDestroyed || !this.widget) return;
    
    try {
      this.widget.screen?.render();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Render error'));
    }
  }

  public update(data: any): void {
    if (this.isDestroyed || !this.statusBox) return;

    try {
      const statusText = this.formatStatus(data);
      this.statusBox.setContent(statusText);
      this.render();
      this.updateState({ lastUpdate: new Date() });
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Update error'));
    }
  }

  private formatStatus(data: any): string {
    const lines = [
      'PolyV Monitoring Dashboard',
      '',
      `Status: ${data?.status || 'Running'}`,
      `Uptime: ${data?.uptime || '0s'}`,
      `Layout: ${data?.layout || 'default'}`,
      `Components: ${data?.components || '0'}`,
      '',
      'Press ? for help, q to quit',
    ];

    return lines.join('\n');
  }
}

// Factory for status component
export const StatusComponentFactory = {
  type: 'status',
  create: (config: ComponentConfig, eventBus: EventEmitter) => {
    return new StatusComponent(config, eventBus);
  },
};
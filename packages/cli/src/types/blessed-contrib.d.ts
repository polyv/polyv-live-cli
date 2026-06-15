declare module 'blessed-contrib' {
  import blessed from 'blessed';

  export interface GridOptions {
    rows: number;
    cols: number;
    screen?: blessed.Screen;
  }

  export interface LineOptions {
    style?: {
      line?: string;
      text?: string;
      baseline?: string;
    };
    xLabelPadding?: number;
    xPadding?: number;
    yLabelPadding?: number;
    yPadding?: number;
    legend?: {
      width?: number;
      height?: number;
    };
    wholeNumbersOnly?: boolean;
    numYLabels?: number;
    numXLabels?: number;
    label?: string;
    showLegend?: boolean;
    abbreviate?: boolean;
    minY?: number;
    maxY?: number;
  }

  export interface BarOptions {
    label?: string;
    barWidth?: number;
    barSpacing?: number;
    xOffset?: number;
    maxHeight?: number;
    height?: string;
    width?: string;
    left?: string;
    top?: string;
    border?: object;
    style?: object;
  }

  export interface GaugeOptions {
    label?: string;
    stroke?: string;
    fill?: string;
    gaugeSpacing?: number;
    gaugeHeight?: number;
    showLabel?: boolean;
    height?: string;
    width?: string;
    left?: string;
    top?: string;
    border?: object;
    style?: object;
  }

  export interface TableOptions {
    keys?: boolean;
    fg?: string;
    selectedFg?: string;
    selectedBg?: string;
    interactive?: boolean;
    label?: string;
    width?: string;
    height?: string;
    left?: string;
    top?: string;
    border?: object;
    columnSpacing?: number;
    columnWidth?: number[];
    style?: object;
  }

  export interface LogOptions {
    fg?: string;
    selectedFg?: string;
    label?: string;
    height?: string;
    width?: string;
    left?: string;
    top?: string;
    border?: object;
    style?: object;
  }

  export interface MapOptions {
    label?: string;
    height?: string;
    width?: string;
    left?: string;
    top?: string;
    border?: object;
    style?: object;
  }

  export interface Grid {
    set(row: number, col: number, rowSpan: number, colSpan: number, widget: any, options?: any): any;
  }

  export interface LineChart extends blessed.Widgets.BoxElement {
    setData(data: Array<{ title: string; x: string[]; y: number[]; style?: { line?: string } }>): void;
    options: LineOptions;
  }

  export interface BarChart extends blessed.Widgets.BoxElement {
    setData(data: { titles: string[]; data: number[] }): void;
    options: BarOptions;
  }

  export interface Gauge extends blessed.Widgets.BoxElement {
    setPercent(percent: number): void;
    options: GaugeOptions;
  }

  export interface Table extends blessed.Widgets.BoxElement {
    setData(data: { headers: string[]; data: string[][] }): void;
    options: TableOptions;
  }

  export interface Log extends blessed.Widgets.BoxElement {
    log(message: string): void;
    options: LogOptions;
  }

  export interface Map extends blessed.Widgets.BoxElement {
    addMarker(marker: { lon: number; lat: number; color?: string; char?: string }): void;
    options: MapOptions;
  }

  export function grid(options: GridOptions): Grid;
  export function line(options?: LineOptions): LineChart;
  export function bar(options?: BarOptions): BarChart;
  export function gauge(options?: GaugeOptions): Gauge;
  export function table(options?: TableOptions): Table;
  export function log(options?: LogOptions): Log;
  export function map(options?: MapOptions): Map;
}
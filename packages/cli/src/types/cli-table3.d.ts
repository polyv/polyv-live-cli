declare module 'cli-table3' {
  interface TableOptions {
    head?: string[];
    style?: {
      head?: string[];
    };
  }

  class Table {
    constructor(options?: TableOptions);
    push(row: any[] | { [key: string]: any }): void;
    toString(): string;
  }

  export = Table;
}
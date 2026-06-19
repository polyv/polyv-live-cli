/**
 * Global CLI command types.
 */

export type GlobalOutputFormat = 'table' | 'json';

export interface GlobalServiceConfig {
  baseUrl: string;
  timeout?: number;
  debug?: boolean;
}

export interface GlobalBaseOptions {
  output?: GlobalOutputFormat;
}

export interface GlobalAuthUpdateOptions extends GlobalBaseOptions {
  authSettings: unknown[];
  force?: boolean;
}

export interface GlobalPageSettingUpdateOptions extends GlobalBaseOptions {
  config: Record<string, unknown>;
  force?: boolean;
}

/**
 * @fileoverview Shared types for the MCP tool manifest generator.
 *
 * Manifest shape is defined by Story 1 (Doubao MCP plugin, CAP-5 / AD-5):
 * the manifest is a versioned, reproducible artifact; the curated whitelist
 * is an explicit field of this file (single source of truth for visibility).
 */

/** Verb classification inferred from the leaf command name (and description as fallback). */
export type VerbClass = 'read' | 'write' | 'unknown';

/** How much we trust an inferred enum for a parameter. */
export type EnumConfidence = 'high' | 'medium' | 'low';

/** Where a parameter comes from: a Commander option flag or a positional argument. */
export type ParamOrigin = 'option' | 'positional';

export interface ParamSchema {
  type: 'string' | 'integer' | 'number' | 'boolean' | 'array';
  /** Item schema for array (variadic) parameters. */
  items?: { type: 'string' | 'integer' | 'number' | 'boolean' };
  /** Original long flag, e.g. "--category-id". Absent for positional parameters. */
  flag?: string;
  /** Original positional argument token, e.g. "<name>". Absent for option parameters. */
  arg?: string;
  /** "option" (from --flag) or "positional" (from `<name>` in .command()). */
  origin: ParamOrigin;
  description?: string;
  /** Inferred allowed values, when determinable. */
  enum?: string[];
  /** Trust level for `enum`. "low" = a value-validating parser exists but allowed values could not be extracted. */
  enumConfidence?: EnumConfidence;
  /** Declared default value (JSON primitives only). */
  default?: string | number | boolean;
}

export interface InputSchema {
  type: 'object';
  properties: Record<string, ParamSchema>;
  required: string[];
  additionalProperties: false;
}

export interface ToolEntry {
  /** `mcp_polyv_` + command path segments, lowercased, kebab→snake. */
  name: string;
  /** Command description (all CLI leaves carry one). */
  description: string;
  /** Original CLI command path, e.g. ["account","api","playback","list"]. */
  commandPath: string[];
  /** read | write | unknown, inferred from the leaf verb. */
  verbClass: VerbClass;
  /** True when the CLI exempts this command path from --source (auth/account/use/config). */
  sourceExempt: boolean;
  /** Implicit global params the MCP server injects server-side; never part of inputSchema. */
  serverInjected: string[];
  inputSchema: InputSchema;
}

export interface ManifestStats {
  topLevelCommands: number;
  treeNodes: number;
  leafTools: number;
  maxDepth: number;
  toolsByVerbClass: { read: number; write: number; unknown: number };
  enumCoverage: { high: number; medium: number; low: number; none: number };
  sourceInjectedTools: number;
  sourceExemptTools: number;
  /** Command paths whose own --source option is shadowed at runtime by the global --source. */
  sourceParamShadowed: string[][];
  /** Non-fatal anomalies recorded while walking the tree (e.g. duplicate param names). */
  warnings: string[];
}

export interface ToolManifest {
  /** Bump on breaking manifest shape changes. Consumers unknown-field-reject + fail-closed (AD-5). */
  formatVersion: string;
  generator: { name: string; version: string };
  cli: { package: string; version: string; commanderVersion: string };
  stats: ManifestStats;
  /** Curated whitelist (tool names). Empty until D3 selection lands; the only visibility source. */
  curatedWhitelist: string[];
  /** Full leaf inventory, deterministically sorted by commandPath. */
  tools: ToolEntry[];
  /** ISO timestamp — the only volatile field; kept last for clean diffs. */
  generatedAt: string;
}

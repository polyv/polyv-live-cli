/**
 * @fileoverview @polyv/tool-manifest public API (Story 1 / CAP-5).
 */

export * from './types';
export { FORMAT_VERSION, buildManifest, serializeManifest } from './manifest';
export { toolNameFromPath, normalizeSegment, findNameCollisions, TOOL_NAME_PREFIX } from './naming';
export { buildInputSchema, EXCLUDED_FLAGS } from './schema';
export { classifyVerb } from './verb';
export {
  loadCliTree,
  ensureCliBuilt,
  cliDistDir,
  resolveCliPackageDir,
  sourceExemptCommandNames,
  collectLeaves,
  collectTreeStats,
} from './load-cli';
export { inferEnumFromDescription, inferEnumFromParser } from './enum-inference';

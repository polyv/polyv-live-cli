/**
 * @fileoverview Tool naming rules (Story 1 / AD-5).
 *
 * Tool name = `mcp_polyv_` + command path segments, all lowercase,
 * kebab-case segments converted to snake_case. All path levels
 * participate (4-level paths included), e.g.
 *   ["account","api","playback","list"] -> mcp_polyv_account_api_playback_list
 */

export const TOOL_NAME_PREFIX = 'mcp_polyv_';

/** Normalize a single command path segment for use inside a tool name. */
export function normalizeSegment(segment: string): string {
  return segment.trim().toLowerCase().replace(/-/g, '_');
}

/** Build the deterministic MCP tool name for a command path. */
export function toolNameFromPath(commandPath: string[]): string {
  if (commandPath.length === 0) {
    throw new Error('commandPath must not be empty');
  }
  return TOOL_NAME_PREFIX + commandPath.map(normalizeSegment).join('_');
}

/** True when two different paths would collide on the same tool name. */
export function findNameCollisions(paths: string[][]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const path of paths) {
    const name = toolNameFromPath(path);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return new Map([...counts.entries()].filter(([, count]) => count > 1));
}

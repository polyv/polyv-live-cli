/**
 * Unit tests for per-invocation source declaration
 */

import {
  isExemptInvocation,
  isValidSourceFormat,
  normalizeSource,
  resolveSource,
  setResolvedSource,
  getResolvedSource,
  resetResolvedSource,
  SOURCE_REQUIRED_MESSAGE,
} from './source-context';

describe('Exempt Invocation Detection', () => {
  it('should exempt bootstrap commands at any level of the invocation path', () => {
    expect(isExemptInvocation(['current', 'account'])).toBe(true);
    expect(isExemptInvocation(['status', 'auth'])).toBe(true);
    expect(isExemptInvocation(['set-default', 'account'])).toBe(true);
  });

  it('should not exempt API-bound commands', () => {
    expect(isExemptInvocation(['list', 'channel'])).toBe(false);
    expect(isExemptInvocation(['get', 'list', 'channel'])).toBe(false);
  });
});

describe('Source Declaration Utilities', () => {
  describe('resolveSource', () => {
    it('should accept a valid flag value, normalized', () => {
      expect(resolveSource({ source: 'WorkBuddy ' })).toEqual({ source: 'workbuddy' });
    });

    it('should reject a missing source with the teaching message', () => {
      const outcome = resolveSource({});
      expect(outcome).toEqual({ error: SOURCE_REQUIRED_MESSAGE });
      expect(resolveSource({ source: '' })).toEqual({ error: SOURCE_REQUIRED_MESSAGE });
    });

    it('should reject invalid formats', () => {
      const outcome = resolveSource({ source: '坏值!' });
      expect('error' in outcome && outcome.error).toContain('无效');
      expect('error' in resolveSource({ source: '-leading-dash' })).toBe(true);
      expect('error' in resolveSource({ source: 'x'.repeat(33) })).toBe(true);
    });

    it('should accept long-tail agent self-declarations', () => {
      expect(resolveSource({ source: 'codex' })).toEqual({ source: 'codex' });
      expect(resolveSource({ source: 'claude-code' })).toEqual({ source: 'claude-code' });
    });
  });

  describe('isValidSourceFormat / normalizeSource', () => {
    it('should enforce lowercase alnum + dash, ≤ 32 chars, alphanumeric start', () => {
      expect(isValidSourceFormat('workbuddy')).toBe(true);
      expect(isValidSourceFormat('a')).toBe(true);
      expect(isValidSourceFormat('-abc')).toBe(false);
      expect(isValidSourceFormat('Has_Underscore')).toBe(false);
      expect(isValidSourceFormat('a'.repeat(33))).toBe(false);
      expect(normalizeSource('  Codex ')).toBe('codex');
    });
  });

  describe('resolved source context', () => {
    it('should store and reset the per-process resolution', () => {
      resetResolvedSource();
      expect(getResolvedSource()).toBeNull();
      setResolvedSource({ source: 'workbuddy' });
      expect(getResolvedSource()).toEqual({ source: 'workbuddy' });
      resetResolvedSource();
      expect(getResolvedSource()).toBeNull();
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  PolyVErrorCode,
  ERROR_MESSAGES,
  ERROR_CATEGORIES,
  getErrorMessage,
  isPolyVErrorCode,
  getErrorMessageByCode,
  getErrorCodeCategory,
} from './error-codes.js';

describe('error-codes', () => {
  describe('PolyVErrorCode', () => {
    it('should have authentication error codes in 20000-20999 range', () => {
      expect(PolyVErrorCode.INVALID_APP_ID).toBe(20001);
      expect(PolyVErrorCode.INVALID_SIGNATURE).toBe(20002);
      expect(PolyVErrorCode.TIMESTAMP_EXPIRED).toBe(20003);
      expect(PolyVErrorCode.DUPLICATE_REQUEST).toBe(20004);
      expect(PolyVErrorCode.INVALID_SIGNATURE_METHOD).toBe(20005);
    });

    it('should have parameter error codes in 10000-19999 range', () => {
      expect(PolyVErrorCode.INVALID_PARAMETER).toBe(10001);
      expect(PolyVErrorCode.MISSING_REQUIRED_PARAMETER).toBe(10002);
      expect(PolyVErrorCode.INVALID_PARAMETER_FORMAT).toBe(10003);
    });

    it('should have channel error codes in 30000-39999 range', () => {
      expect(PolyVErrorCode.CHANNEL_NOT_FOUND).toBe(30001);
      expect(PolyVErrorCode.CHANNEL_DISABLED).toBe(30002);
      expect(PolyVErrorCode.CHANNEL_EXPIRED).toBe(30003);
      expect(PolyVErrorCode.CHANNEL_LIMIT_EXCEEDED).toBe(30004);
    });

    it('should have permission error codes in 40000-49999 range', () => {
      expect(PolyVErrorCode.PERMISSION_DENIED).toBe(40001);
      expect(PolyVErrorCode.INSUFFICIENT_BALANCE).toBe(40002);
      expect(PolyVErrorCode.FEATURE_NOT_ENABLED).toBe(40003);
    });

    it('should have service error codes in 50000-59999 range', () => {
      expect(PolyVErrorCode.INTERNAL_ERROR).toBe(50001);
      expect(PolyVErrorCode.SERVICE_UNAVAILABLE).toBe(50002);
      expect(PolyVErrorCode.REQUEST_TIMEOUT).toBe(50003);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have messages for all error codes', () => {
      const codes = Object.values(PolyVErrorCode).filter(
        (v) => typeof v === 'number'
      ) as number[];
      expect(Object.keys(ERROR_MESSAGES)).toHaveLength(codes.length);
    });

    it('should return Chinese messages', () => {
      expect(ERROR_MESSAGES[PolyVErrorCode.INVALID_APP_ID]).toBe('无效的 appId');
      expect(ERROR_MESSAGES[PolyVErrorCode.INVALID_SIGNATURE]).toBe('签名验证失败');
      expect(ERROR_MESSAGES[PolyVErrorCode.CHANNEL_NOT_FOUND]).toBe('频道不存在');
    });
  });

  describe('ERROR_CATEGORIES', () => {
    it('should have all required categories', () => {
      expect(ERROR_CATEGORIES.AUTH).toBeDefined();
      expect(ERROR_CATEGORIES.PARAMETER).toBeDefined();
      expect(ERROR_CATEGORIES.CHANNEL).toBeDefined();
      expect(ERROR_CATEGORIES.PERMISSION).toBeDefined();
      expect(ERROR_CATEGORIES.SERVICE).toBeDefined();
    });

    it('should have correct ranges for AUTH category', () => {
      expect(ERROR_CATEGORIES.AUTH.range).toEqual({ min: 20000, max: 20999 });
    });

    it('should have correct ranges for PARAMETER category', () => {
      expect(ERROR_CATEGORIES.PARAMETER.range).toEqual({ min: 10000, max: 19999 });
    });

    it('should have correct ranges for CHANNEL category', () => {
      expect(ERROR_CATEGORIES.CHANNEL.range).toEqual({ min: 30000, max: 39999 });
    });

    it('should have correct ranges for PERMISSION category', () => {
      expect(ERROR_CATEGORIES.PERMISSION.range).toEqual({ min: 40000, max: 49999 });
    });

    it('should have correct ranges for SERVICE category', () => {
      expect(ERROR_CATEGORIES.SERVICE.range).toEqual({ min: 50000, max: 59999 });
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct message for INVALID_APP_ID', () => {
      expect(getErrorMessage(PolyVErrorCode.INVALID_APP_ID)).toBe('无效的 appId');
    });

    it('should return correct message for INVALID_SIGNATURE', () => {
      expect(getErrorMessage(PolyVErrorCode.INVALID_SIGNATURE)).toBe('签名验证失败');
    });

    it('should return correct message for CHANNEL_NOT_FOUND', () => {
      expect(getErrorMessage(PolyVErrorCode.CHANNEL_NOT_FOUND)).toBe('频道不存在');
    });

    it('should return correct message for PERMISSION_DENIED', () => {
      expect(getErrorMessage(PolyVErrorCode.PERMISSION_DENIED)).toBe('权限不足');
    });

    it('should return correct message for INTERNAL_ERROR', () => {
      expect(getErrorMessage(PolyVErrorCode.INTERNAL_ERROR)).toBe('服务内部错误');
    });
  });

  describe('isPolyVErrorCode', () => {
    it('should return true for valid error codes', () => {
      expect(isPolyVErrorCode(20001)).toBe(true);
      expect(isPolyVErrorCode(10001)).toBe(true);
      expect(isPolyVErrorCode(30001)).toBe(true);
      expect(isPolyVErrorCode(40001)).toBe(true);
      expect(isPolyVErrorCode(50001)).toBe(true);
    });

    it('should return false for invalid error codes', () => {
      expect(isPolyVErrorCode(0)).toBe(false);
      expect(isPolyVErrorCode(999)).toBe(false);
      expect(isPolyVErrorCode(99999)).toBe(false);
      expect(isPolyVErrorCode(-1)).toBe(false);
    });
  });

  describe('getErrorMessageByCode', () => {
    it('should return correct message for valid codes', () => {
      expect(getErrorMessageByCode(20001)).toBe('无效的 appId');
      expect(getErrorMessageByCode(30001)).toBe('频道不存在');
    });

    it('should return default message for unknown codes', () => {
      expect(getErrorMessageByCode(99999)).toBe('未知错误');
    });

    it('should return custom default message when provided', () => {
      expect(getErrorMessageByCode(99999, '自定义错误')).toBe('自定义错误');
    });

    it('should return empty custom default message', () => {
      expect(getErrorMessageByCode(99999, '')).toBe('');
    });
  });

  describe('getErrorCodeCategory', () => {
    it('should return AUTH for authentication codes', () => {
      expect(getErrorCodeCategory(20000)).toBe('AUTH');
      expect(getErrorCodeCategory(20001)).toBe('AUTH');
      expect(getErrorCodeCategory(20999)).toBe('AUTH');
    });

    it('should return PARAMETER for parameter codes', () => {
      expect(getErrorCodeCategory(10000)).toBe('PARAMETER');
      expect(getErrorCodeCategory(15000)).toBe('PARAMETER');
      expect(getErrorCodeCategory(19999)).toBe('PARAMETER');
    });

    it('should return CHANNEL for channel codes', () => {
      expect(getErrorCodeCategory(30000)).toBe('CHANNEL');
      expect(getErrorCodeCategory(35000)).toBe('CHANNEL');
      expect(getErrorCodeCategory(39999)).toBe('CHANNEL');
    });

    it('should return PERMISSION for permission codes', () => {
      expect(getErrorCodeCategory(40000)).toBe('PERMISSION');
      expect(getErrorCodeCategory(45000)).toBe('PERMISSION');
      expect(getErrorCodeCategory(49999)).toBe('PERMISSION');
    });

    it('should return SERVICE for service codes', () => {
      expect(getErrorCodeCategory(50000)).toBe('SERVICE');
      expect(getErrorCodeCategory(55000)).toBe('SERVICE');
      expect(getErrorCodeCategory(59999)).toBe('SERVICE');
    });

    it('should return UNKNOWN for codes outside all ranges', () => {
      expect(getErrorCodeCategory(0)).toBe('UNKNOWN');
      expect(getErrorCodeCategory(999)).toBe('UNKNOWN');
      expect(getErrorCodeCategory(99999)).toBe('UNKNOWN');
    });
  });
});

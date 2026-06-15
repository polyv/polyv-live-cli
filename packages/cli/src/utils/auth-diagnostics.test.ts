/**
 * @fileoverview Unit tests for Authentication Diagnostics
 * Tests the diagnostic functionality for authentication system
 */

import { AuthDiagnostics } from './auth-diagnostics';
import { AuthenticationProvider } from '../types/auth-source.types';
import {
  AuthenticationSource,
  AuthenticationContext,
  AuthenticationSourceType,
} from '../types/auth-source.types';

// Mock authentication provider
const mockAuthProvider: AuthenticationProvider = {
  getDiagnostics: jest.fn(),
  getAuthenticationContext: jest.fn(),
};

describe('AuthDiagnostics', () => {
  let authDiagnostics: AuthDiagnostics;

  beforeEach(() => {
    authDiagnostics = new AuthDiagnostics(mockAuthProvider);
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with authentication provider', () => {
      expect(authDiagnostics).toBeInstanceOf(AuthDiagnostics);
    });
  });

  describe('runDiagnostics', () => {
    it('should return success status with valid authentication', () => {
      const mockSource: AuthenticationSource = {
        type: 'command-line' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 1,
        metadata: {
          source: '命令行参数',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics();

      expect(result.status).toBe('success');
      expect(result.summary).toContain('认证配置正常');
      expect(result.details.sources).toHaveLength(1);
      expect(result.details.selectedSource).toEqual(mockSource);
    });

    it('should return error status when no authentication found', () => {
      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [],
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(null);

      const result = authDiagnostics.runDiagnostics();

      expect(result.status).toBe('error');
      expect(result.summary).toContain('认证配置存在');
      expect(result.details.issues).toHaveLength(1);
      expect(result.details.issues[0].type).toBe('no_authentication');
    });

    it('should return warning status with incomplete authentication', () => {
      const mockSource: AuthenticationSource = {
        type: 'session' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: '', // incomplete
        priority: 2,
        metadata: {
          source: '会话账号',
          context: { error: true, message: '账号配置有问题' },
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics();

      expect(result.status).toBe('error'); // Due to incomplete authentication
      expect(result.details.issues.length).toBeGreaterThanOrEqual(1);
      expect(result.details.issues.some(i => i.type === 'session_account_issue')).toBe(true);
      expect(result.details.issues.some(i => i.type === 'incomplete_authentication')).toBe(true);
    });

    it('should include verbose information when requested', () => {
      const mockSource: AuthenticationSource = {
        type: 'environment' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-secret',
        priority: 3,
        metadata: {
          source: '环境变量',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics({}, true);

      expect(result.verbose).toBeDefined();
      expect(result.verbose?.timeline).toBeDefined();
      expect(result.verbose?.environment).toBeDefined();
      expect(result.verbose?.configuration).toBeDefined();
      expect(result.verbose?.environment.nodeVersion).toBe(process.version);
    });

    it('should handle multiple incomplete sources', () => {
      const incompleteSource1: AuthenticationSource = {
        type: 'config' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: '', // incomplete
        priority: 4,
        metadata: {
          source: '全局配置',
        },
      };

      const incompleteSource2: AuthenticationSource = {
        type: 'environment' as AuthenticationSourceType,
        appId: '',
        appSecret: 'test-secret', // incomplete
        priority: 3,
        metadata: {
          source: '环境变量',
        },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [incompleteSource1, incompleteSource2],
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(null);

      const result = authDiagnostics.runDiagnostics();

      expect(result.status).toBe('error');
      expect(result.details.issues.some(i => i.type === 'incomplete_sources')).toBe(true);
      expect(result.details.recommendations.some(r => r.includes('多个认证源'))).toBe(true);
    });
  });

  describe('generateReport', () => {
    it('should generate readable report for successful authentication', () => {
      const mockSource: AuthenticationSource = {
        type: 'command-line' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 1,
        metadata: {
          source: '命令行参数',
          accountName: 'test-account',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const report = authDiagnostics.generateReport();

      expect(report).toContain('PolyV CLI 认证诊断报告');
      expect(report).toContain('✅');
      expect(report).toContain('当前认证源');
      expect(report).toContain('命令行参数');
      expect(report).toContain('test-account');
      expect(report).toContain('优先级: 1');
      expect(report).toContain('可用认证源');
    });

    it('should generate report with issues and recommendations', () => {
      const incompleteSource: AuthenticationSource = {
        type: 'session' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: '', // incomplete
        priority: 2,
        metadata: {
          source: '会话账号',
          context: { error: true, message: '配置有误' },
        },
      };

      const mockContext: AuthenticationContext = {
        source: incompleteSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [incompleteSource],
        selectedSource: incompleteSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const report = authDiagnostics.generateReport();

      expect(report).toContain('PolyV CLI 认证诊断报告');
      expect(report).toContain('❌');
      expect(report).toContain('发现的问题');
      expect(report).toContain('建议操作');
      expect(report).toContain('缺少: appSecret');
    });

    it('should include verbose information in report when requested', () => {
      const mockSource: AuthenticationSource = {
        type: 'config' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-secret',
        priority: 4,
        metadata: {
          source: '全局配置',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const report = authDiagnostics.generateReport({}, true);

      expect(report).toContain('详细信息');
      expect(report).toContain('诊断时间线');
      expect(report).toContain('环境信息');
      expect(report).toContain('nodeVersion');
    });

    it('should handle no authentication scenario in report', () => {
      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [],
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(null);

      const report = authDiagnostics.generateReport();

      expect(report).toContain('PolyV CLI 认证诊断报告');
      expect(report).toContain('❌');
      expect(report).toContain('未找到有效的认证信息');
      expect(report).toContain('polyv-live-cli account add');
    });
  });

  describe('Source-specific analysis', () => {
    it('should provide command-line specific recommendations', () => {
      const mockSource: AuthenticationSource = {
        type: 'command-line' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 1,
        metadata: {
          source: '命令行参数',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics();

      expect(result.details.recommendations.some(r => r.includes('命令行参数具有最高优先级'))).toBe(true);
    });

    it('should provide session-specific recommendations', () => {
      const mockSource: AuthenticationSource = {
        type: 'session' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 2,
        metadata: {
          source: '会话账号',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics();

      expect(result.details.recommendations.some(r => r.includes('会话账号仅在当前终端有效'))).toBe(true);
    });

    it('should provide environment-specific recommendations', () => {
      const mockSource: AuthenticationSource = {
        type: 'environment' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 3,
        metadata: {
          source: '环境变量',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics();

      expect(result.details.recommendations.some(r => r.includes('环境变量在整个系统会话中有效'))).toBe(true);
    });

    it('should provide config-specific recommendations', () => {
      const mockSource: AuthenticationSource = {
        type: 'config' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 4,
        metadata: {
          source: '全局配置',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics();

      expect(result.details.recommendations.some(r => r.includes('全局配置是默认的认证方式'))).toBe(true);
    });
  });

  describe('Environment and configuration info', () => {
    it('should collect correct environment information', () => {
      const mockSource: AuthenticationSource = {
        type: 'command-line' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 1,
        metadata: {
          source: '命令行参数',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics({}, true);

      expect(result.verbose?.environment.nodeVersion).toBe(process.version);
      expect(result.verbose?.environment.platform).toBe(process.platform);
      expect(result.verbose?.environment.arch).toBe(process.arch);
      expect(result.verbose?.environment.cwd).toBe(process.cwd());
      expect(result.verbose?.environment.envVarsSet).toHaveProperty('POLYV_APP_ID');
      expect(result.verbose?.environment.envVarsSet).toHaveProperty('POLYV_APP_SECRET');
      expect(result.verbose?.environment.envVarsSet).toHaveProperty('POLYV_USER_ID');
    });

    it('should collect configuration information from options', () => {
      const options = {
        appId: 'test-app-id',
        appSecret: 'test-secret',
        userId: 'test-user',
      };

      const mockSource: AuthenticationSource = {
        type: 'command-line' as AuthenticationSourceType,
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        priority: 1,
        metadata: {
          source: '命令行参数',
        },
      };

      const mockContext: AuthenticationContext = {
        source: mockSource,
        metadata: { diagnostics: true },
      };

      (mockAuthProvider.getDiagnostics as jest.Mock).mockReturnValue({
        availableSources: [mockSource],
        selectedSource: mockSource,
        warnings: [],
        suggestions: [],
      });

      (mockAuthProvider.getAuthenticationContext as jest.Mock).mockReturnValue(mockContext);

      const result = authDiagnostics.runDiagnostics(options, true);

      expect(result.verbose?.configuration.commandLineOptions.appId).toBe(true);
      expect(result.verbose?.configuration.commandLineOptions.appSecret).toBe(true);
      expect(result.verbose?.configuration.commandLineOptions.userId).toBe(true);
      expect(result.verbose?.configuration.timestamp).toBeDefined();
    });
  });
});
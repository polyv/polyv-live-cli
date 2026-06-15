/**
 * @fileoverview TypeScript type definitions for AI Digital Human management
 * @author Development Team
 * @since 14.4.0
 */

/**
 * Service configuration for AI Digital Human operations
 */
export interface AIDigitalHumanServiceConfig {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

/**
 * AI数字人信息
 */
export interface AIDigitalHuman {
  id: number;
  name: string;
  thirdRoleCode: string;
  coverPhoto: string;
  fullBodyPhoto: string;
  defaultTtsVoiceId: number;
  clothesDesc: string;
  createTime: number;
}

/**
 * AI数字人列表响应
 */
export interface AIDigitalHumanListResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  contents: AIDigitalHuman[];
}

/**
 * AI数字人关联组织
 */
export interface AIDigitalHumanOrganization {
  aiDigitalHumanId: number;
  organizationIds: number[];
  includeChildren: boolean;
}

/**
 * 设置组织关联参数
 */
export interface SetOrganizationParams {
  aiDigitalHumanId: number;
  organizationIds: number[];
  includeChildren: boolean;
}

/**
 * list 命令选项
 */
export interface AIDigitalHumanListOptions {
  page?: number;
  size?: number;
  output?: 'table' | 'json';
}

/**
 * list-org 命令选项
 */
export interface AIDigitalHumanListOrgOptions {
  ids: string;
  output?: 'table' | 'json';
}

/**
 * set-org 命令选项
 */
export interface AIDigitalHumanSetOrgOptions {
  config?: string;
  aiDigitalHumanId?: string;
  organizationIds?: string;
  includeChildren?: boolean;
  output?: 'table' | 'json';
}

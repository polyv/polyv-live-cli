/**
 * Group Service Types
 *
 * Types for the PolyV Group Account Management API (v2)
 * These APIs are used for managing sub-account resource allocation
 *
 * @module types/group
 */

// ============================================
// AC1: Allocation Records API Types
// ============================================

/**
 * Type of allocation record filter
 * - all: Include both VOD and live records
 * - live: Live streaming records only
 * - vod: VOD records only
 */
export type AllocateLogType = 'all' | 'live' | 'vod';

/**
 * Allocation origin type
 * Describes the type of allocation action performed
 */
export type AllocateOrigin =
  | 'ADD_CONCURRENCES'
  | 'ADD_DURATION'
  | 'ADD_FLOW'
  | 'ADD_SPACE'
  | 'RECOVER_CONCURRENCES'
  | 'RECOVER_DURATION'
  | 'RECOVER_FLOW'
  | 'RECOVER_SPACE';

/**
 * Allocation log content item
 * Represents a single allocation record
 */
export interface GroupAllocateLogContent {
  /** Sub-account email */
  email: string;
  /** Allocation record timestamp */
  date: string;
  /** Origin type code */
  origin: string;
  /** Origin description text */
  originText: string;
  /** Allocated VOD space in bytes (null if not applicable) */
  space: string | null;
  /** Allocated VOD flow in bytes (null if not applicable) */
  flow: string | null;
  /** Channel allocation value (null if not applicable) */
  channels: string | null;
  /** Concurrency allocation value */
  concurrences: number | null;
  /** Duration allocation value in minutes (null if not applicable) */
  duration: string | null;
}

/**
 * Parameters for listAllocateLog
 */
export interface ListAllocateLogParams {
  /** Sub-account emails, comma-separated (required) */
  emails: string;
  /** Record type filter: all, live, or vod */
  type?: AllocateLogType;
  /** Query start time, format: yyyy-MM-dd HH:mm:ss */
  startTime?: string;
  /** Query end time, format: yyyy-MM-dd HH:mm:ss */
  endTime?: string;
  /** Page number (1-indexed) */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Response for listAllocateLog
 */
export interface ListAllocateLogResponse {
  /** Current page number */
  pageNumber: number;
  /** Total number of pages */
  totalPages: number;
  /** Page size */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Allocation log contents */
  contents: GroupAllocateLogContent[];
}

// ============================================
// AC2: Set Concurrency API Types
// ============================================

/**
 * Allocation type
 * - add: Add/allocate resources
 * - recover: Recover/reclaim resources
 */
export type AllocationType = 'add' | 'recover';

/**
 * Parameters for setConcurrences
 */
export interface SetConcurrencesParams {
  /** Sub-account email (required) */
  email: string;
  /** Allocation type: add or recover (default: add) */
  type?: AllocationType;
  /** Concurrency count, must be a positive integer (required for add) */
  concurrences: number;
}

// ============================================
// AC3: Set Flow API Types
// ============================================

/**
 * Parameters for setFlow
 */
export interface SetFlowParams {
  /** Sub-account email (required) */
  email: string;
  /** Allocation type: add or recover (default: add) */
  type?: AllocationType;
  /** Recover all flag: 1 = recover all (only valid when type=recover) */
  all?: 1;
}

// ============================================
// AC4: Set Live Durations API Types
// ============================================

/**
 * Parameters for setLiveDurations
 */
export interface SetLiveDurationsParams {
  /** Sub-account email (required) */
  email: string;
  /** Allocation type: add or recover (default: add) */
  type?: AllocationType;
  /** Duration in minutes, must be a positive integer (required) */
  duration: number;
}

// ============================================
// AC5: Set Space API Types
// ============================================

/**
 * Parameters for setSpace
 */
export interface SetSpaceParams {
  /** Sub-account email (required) */
  email: string;
  /** Allocation type: add or recover (default: add) */
  type?: AllocationType;
  /** Space in GB (required for add) */
  space?: number;
  /** Recover all flag: 1 = recover all (only valid when type=recover) */
  all?: 1;
}

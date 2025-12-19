// SPDX-License-Identifier: MIT
// apps/frontend/src/features/shared/types.ts

/**
 * Common data item interface used across feature modules
 */
export interface BaseDataItem {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Common status types used across the application
 */
export type CommonStatus =
  | "active"
  | "inactive"
  | "pending"
  | "draft"
  | "completed"
  | "cancelled";

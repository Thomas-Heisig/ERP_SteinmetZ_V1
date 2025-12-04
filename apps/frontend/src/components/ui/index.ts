// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/index.ts

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { Tabs } from "./Tabs";
export type { Tab, TabsProps } from "./Tabs";

export { Select } from "./Select";
export type { SelectOption, SelectProps } from "./Select";

export { ToastProvider, useToast, toast } from "./Toast";
export type { Toast, ToastType } from "./Toast";

export { Table } from "./Table";
export type { Column, TableProps } from "./Table";

export { ErrorBoundary, withErrorBoundary } from "./ErrorBoundary";

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonDashboard,
} from "./Skeleton";
export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonCardProps,
  SkeletonTableProps,
  SkeletonListProps,
  SkeletonDashboardProps,
} from "./Skeleton";

export {
  Suspense,
  SuspenseDashboard,
  SuspenseList,
  SuspenseTable,
  SuspenseCard,
} from "./Suspense";
export type { SuspenseProps } from "./Suspense";

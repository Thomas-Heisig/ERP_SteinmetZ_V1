// apps/frontend/src/components/ui/Suspense.tsx
import { Suspense as ReactSuspense, ReactNode } from "react";
import { SkeletonCard, SkeletonDashboard, SkeletonList, SkeletonTable } from "./Skeleton";

export interface SuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: "card" | "dashboard" | "list" | "table" | "custom";
}

/**
 * Enhanced Suspense wrapper with built-in skeleton fallbacks
 * 
 * Usage:
 * ```tsx
 * <Suspense type="dashboard">
 *   <LazyDashboard />
 * </Suspense>
 * 
 * <Suspense type="list">
 *   <LazyList />
 * </Suspense>
 * 
 * <Suspense fallback={<CustomLoader />}>
 *   <LazyComponent />
 * </Suspense>
 * ```
 */
export function Suspense({ children, fallback, type = "custom" }: SuspenseProps) {
  let defaultFallback: ReactNode;

  switch (type) {
    case "dashboard":
      defaultFallback = <SkeletonDashboard cards={6} />;
      break;
    case "card":
      defaultFallback = <SkeletonCard />;
      break;
    case "list":
      defaultFallback = <SkeletonList items={5} />;
      break;
    case "table":
      defaultFallback = <SkeletonTable rows={5} columns={4} />;
      break;
    case "custom":
    default:
      defaultFallback = fallback || null;
      break;
  }

  return (
    <ReactSuspense fallback={fallback || defaultFallback}>
      {children}
    </ReactSuspense>
  );
}

/**
 * Suspense wrapper specifically for Dashboard components
 */
export function SuspenseDashboard({ children }: { children: ReactNode }) {
  return (
    <ReactSuspense fallback={<SkeletonDashboard cards={6} />}>
      {children}
    </ReactSuspense>
  );
}

/**
 * Suspense wrapper specifically for List components
 */
export function SuspenseList({ children, items = 5 }: { children: ReactNode; items?: number }) {
  return (
    <ReactSuspense fallback={<SkeletonList items={items} />}>
      {children}
    </ReactSuspense>
  );
}

/**
 * Suspense wrapper specifically for Table components
 */
export function SuspenseTable({
  children,
  rows = 5,
  columns = 4,
}: {
  children: ReactNode;
  rows?: number;
  columns?: number;
}) {
  return (
    <ReactSuspense fallback={<SkeletonTable rows={rows} columns={columns} />}>
      {children}
    </ReactSuspense>
  );
}

/**
 * Suspense wrapper specifically for Card components
 */
export function SuspenseCard({ children }: { children: ReactNode }) {
  return (
    <ReactSuspense fallback={<SkeletonCard />}>
      {children}
    </ReactSuspense>
  );
}

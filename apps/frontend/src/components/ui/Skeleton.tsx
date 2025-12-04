// apps/frontend/src/components/ui/Skeleton.tsx
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  className?: string;
}

/**
 * Skeleton Component
 * 
 * Displays a placeholder while content is loading.
 * 
 * Usage:
 * ```tsx
 * <Skeleton variant="text" width="80%" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 * ```
 */
export function Skeleton({
  variant = "text",
  width,
  height,
  animation = "pulse",
  className = "",
}: SkeletonProps) {
  const style: React.CSSProperties = {};

  if (width) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }

  if (height) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  const classes = [
    styles.skeleton,
    styles[variant],
    styles[animation],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} style={style} aria-busy="true" />;
}

/**
 * SkeletonText - Multiple text lines with decreasing widths
 */
export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = "" }: SkeletonTextProps) {
  return (
    <div className={`${styles.skeletonText} ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLastLine = index === lines - 1;
        const width = isLastLine ? "60%" : "100%";
        return <Skeleton key={index} variant="text" width={width} />;
      })}
    </div>
  );
}

/**
 * SkeletonAvatar - Avatar placeholder
 */
export interface SkeletonAvatarProps {
  size?: number;
  className?: string;
}

export function SkeletonAvatar({ size = 40, className = "" }: SkeletonAvatarProps) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

/**
 * SkeletonCard - Card placeholder with avatar and text
 */
export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      <div className={styles.skeletonCardHeader}>
        <SkeletonAvatar size={48} />
        <div className={styles.skeletonCardHeaderText}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
      <div className={styles.skeletonCardContent}>
        <SkeletonText lines={3} />
      </div>
      <div className={styles.skeletonCardFooter}>
        <Skeleton variant="rounded" width={100} height={36} />
        <Skeleton variant="rounded" width={100} height={36} />
      </div>
    </div>
  );
}

/**
 * SkeletonTable - Table placeholder
 */
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = "",
}: SkeletonTableProps) {
  return (
    <div className={`${styles.skeletonTable} ${className}`}>
      {/* Header */}
      <div className={styles.skeletonTableHeader}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" height={20} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={styles.skeletonTableRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonList - List placeholder
 */
export interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonList({
  items = 5,
  showAvatar = true,
  className = "",
}: SkeletonListProps) {
  return (
    <div className={`${styles.skeletonList} ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className={styles.skeletonListItem}>
          {showAvatar && <SkeletonAvatar size={40} />}
          <div className={styles.skeletonListItemContent}>
            <Skeleton variant="text" width="80%" height={18} />
            <Skeleton variant="text" width="60%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonDashboard - Dashboard grid placeholder
 */
export interface SkeletonDashboardProps {
  cards?: number;
  className?: string;
}

export function SkeletonDashboard({
  cards = 6,
  className = "",
}: SkeletonDashboardProps) {
  return (
    <div className={`${styles.skeletonDashboard} ${className}`}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className={styles.skeletonDashboardCard}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
          <Skeleton variant="rectangular" width="100%" height={120} />
        </div>
      ))}
    </div>
  );
}

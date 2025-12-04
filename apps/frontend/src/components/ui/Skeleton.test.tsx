// apps/frontend/src/components/ui/Skeleton.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonDashboard,
} from "./Skeleton";

describe("Skeleton", () => {
  it("should render with default variant", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it("should render with text variant", () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("text");
  });

  it("should render with circular variant", () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("circular");
  });

  it("should render with rectangular variant", () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("rectangular");
  });

  it("should render with rounded variant", () => {
    const { container } = render(<Skeleton variant="rounded" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("rounded");
  });

  it("should apply width as string", () => {
    const { container } = render(<Skeleton width="50%" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveStyle({ width: "50%" });
  });

  it("should apply width as number", () => {
    const { container } = render(<Skeleton width={200} />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveStyle({ width: "200px" });
  });

  it("should apply height as string", () => {
    const { container } = render(<Skeleton height="100px" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveStyle({ height: "100px" });
  });

  it("should apply height as number", () => {
    const { container } = render(<Skeleton height={100} />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveStyle({ height: "100px" });
  });

  it("should apply pulse animation by default", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("pulse");
  });

  it("should apply wave animation when specified", () => {
    const { container } = render(<Skeleton animation="wave" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("wave");
  });

  it("should apply no animation when specified", () => {
    const { container } = render(<Skeleton animation="none" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("none");
  });

  it("should apply custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("custom-class");
  });
});

describe("SkeletonText", () => {
  it("should render default number of lines", () => {
    const { container } = render(<SkeletonText />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    expect(skeletons).toHaveLength(3);
  });

  it("should render specified number of lines", () => {
    const { container } = render(<SkeletonText lines={5} />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    expect(skeletons).toHaveLength(5);
  });

  it("should render last line with reduced width", () => {
    const { container } = render(<SkeletonText lines={2} />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    expect(skeletons[1]).toHaveStyle({ width: "60%" });
  });
});

describe("SkeletonAvatar", () => {
  it("should render with default size", () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("should render with custom size", () => {
    const { container } = render(<SkeletonAvatar size={64} />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveStyle({ width: "64px", height: "64px" });
  });

  it("should render as circular", () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toHaveClass("circular");
  });
});

describe("SkeletonCard", () => {
  it("should render card structure", () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    expect(skeletons.length).toBeGreaterThan(5); // Avatar + header text + content lines + footer buttons
  });

  it("should apply custom className", () => {
    const { container } = render(<SkeletonCard className="custom-card" />);
    expect(container.firstChild).toHaveClass("custom-card");
  });
});

describe("SkeletonTable", () => {
  it("should render default rows and columns", () => {
    const { container } = render(<SkeletonTable />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    // 5 rows * 4 columns + 4 header columns = 24
    expect(skeletons).toHaveLength(24);
  });

  it("should render specified rows and columns", () => {
    const { container } = render(<SkeletonTable rows={3} columns={3} />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    // 3 rows * 3 columns + 3 header columns = 12
    expect(skeletons).toHaveLength(12);
  });
});

describe("SkeletonList", () => {
  it("should render default number of items", () => {
    const { container } = render(<SkeletonList />);
    const items = container.querySelectorAll('.skeletonListItem');
    expect(items).toHaveLength(5);
  });

  it("should render specified number of items", () => {
    const { container } = render(<SkeletonList items={3} />);
    const items = container.querySelectorAll('.skeletonListItem');
    expect(items).toHaveLength(3);
  });

  it("should render with avatar by default", () => {
    const { container } = render(<SkeletonList items={1} />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    // 1 avatar + 2 text lines = 3
    expect(skeletons).toHaveLength(3);
  });

  it("should render without avatar when showAvatar is false", () => {
    const { container } = render(<SkeletonList items={1} showAvatar={false} />);
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    // Only 2 text lines
    expect(skeletons).toHaveLength(2);
  });
});

describe("SkeletonDashboard", () => {
  it("should render default number of cards", () => {
    const { container } = render(<SkeletonDashboard />);
    const cards = container.querySelectorAll('.skeletonDashboardCard');
    expect(cards).toHaveLength(6);
  });

  it("should render specified number of cards", () => {
    const { container } = render(<SkeletonDashboard cards={9} />);
    const cards = container.querySelectorAll('.skeletonDashboardCard');
    expect(cards).toHaveLength(9);
  });

  it("should apply custom className", () => {
    const { container } = render(<SkeletonDashboard className="custom-dashboard" />);
    expect(container.firstChild).toHaveClass("custom-dashboard");
  });
});

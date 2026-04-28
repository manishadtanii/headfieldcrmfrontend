// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — shimmering placeholder components for loading states
// CSS: skeleton-box class + @keyframes skeleton-shimmer in index.css
// ─────────────────────────────────────────────────────────────────────────────

/** Base skeleton block — shimmering box */
export function SkeletonBox({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div
      className="skeleton-box"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/** Skeleton for a stat card (4 per row on dashboard) */
export function StatCardSkeleton() {
  return (
    <div className="skeleton-stat-card">
      <SkeletonBox width={40} height={40} radius={10} style={{ marginBottom: 14 }} />
      <SkeletonBox width="50%" height={26} style={{ marginBottom: 8 }} />
      <SkeletonBox width="72%" height={12} />
    </div>
  );
}

/** Skeleton for a table row */
export function TableRowSkeleton({ cols = 5 }) {
  const widths = ['75%', '55%', '65%', '50%', '60px'];
  return (
    <tr className="skeleton-row">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <SkeletonBox height={13} width={widths[i % widths.length]} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for a card block (announcements, list items) */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="skeleton-card">
      <SkeletonBox width="60%" height={16} style={{ marginBottom: 12 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 ? '50%' : '100%'}
          height={12}
          style={{ marginBottom: 8 }}
        />
      ))}
    </div>
  );
}

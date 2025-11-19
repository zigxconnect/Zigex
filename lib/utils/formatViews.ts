/**
 * Format view counts to human-readable format
 * 1000 => 1k, 1500 => 1.5k, 1000000 => 1M, etc.
 */
export function formatViewCount(count: number): string {
  if (count === 0) return "0";
  if (count < 1000) return count.toString();

  const units = [
    { threshold: 1_000_000_000, suffix: "B", divider: 1_000_000_000 },
    { threshold: 1_000_000, suffix: "M", divider: 1_000_000 },
    { threshold: 1_000, suffix: "K", divider: 1_000 },
  ];

  for (const unit of units) {
    if (count >= unit.threshold) {
      const value = count / unit.divider;
      // Show 1 decimal place if value is less than 10, otherwise show no decimals
      const formatted = value < 10 ? value.toFixed(1) : Math.floor(value).toString();
      return `${formatted}${unit.suffix}`;
    }
  }

  return count.toString();
}

/**
 * Get plural form of view/views
 */
export function getViewLabel(count: number): string {
  return count === 1 ? "view" : "views";
}

/**
 * Format view count with label
 * 1000 => "1k views"
 */
export function formatViewCountWithLabel(count: number): string {
  return `${formatViewCount(count)} ${getViewLabel(count)}`;
}

/**
 * Get a human-readable description of view count
 * Useful for accessibility
 */
export function getViewCountDescription(count: number): string {
  if (count === 0) return "No views yet";
  if (count === 1) return "1 view";
  if (count < 1000) return `${count} views`;
  if (count < 1_000_000) {
    const thousands = Math.floor(count / 1000);
    const remainder = count % 1000;
    if (remainder === 0) return `${thousands} thousand views`;
    return `${thousands} thousand views`;
  }
  if (count < 1_000_000_000) {
    const millions = Math.floor(count / 1_000_000);
    const remainder = count % 1_000_000;
    if (remainder === 0) return `${millions} million views`;
    return `${millions} million views`;
  }
  return `${formatViewCount(count)} views`;
}

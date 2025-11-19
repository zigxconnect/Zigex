/**
 * Simple utility to generate random view counts
 * Returns a number between 0 and 2000
 */
export function getRandomViewCount(): number {
  return Math.floor(Math.random() * 2001); // 0 to 2000 inclusive
}

/**
 * Format view count with K suffix if applicable
 * 1500 -> "1.5k"
 * 500 -> "500"
 * 2000 -> "2k"
 */
export function formatSimpleViewCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  
  const inThousands = count / 1000;
  return inThousands % 1 === 0 ? `${Math.floor(inThousands)}k` : `${inThousands.toFixed(1)}k`;
}

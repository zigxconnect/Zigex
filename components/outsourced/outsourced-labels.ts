const TYPES: Record<string, string> = {
  internship: "Internship",
  program: "Program",
  scholarship: "Scholarship",
  fellowship: "Fellowship",
  competition: "Competition",
  conference: "Summit or conference",
  grant: "Grant",
  training: "Training",
  job: "Job",
};

const FUNDING: Record<string, string> = {
  fully_funded: "Fully funded",
  partially_funded: "Partly funded",
  paid: "Paid",
  unpaid: "Unpaid",
};

export const typeLabel = (type: string) => TYPES[type] ?? "";
export const fundingLabel = (funding: string) => FUNDING[funding] ?? null;
export const placeLabel = (o: { city: string | null; country: string }) => [o.city, o.country].filter(Boolean).join(", ");

/** The API sends plain days (YYYY-MM-DD): format them in UTC so the day never shifts. */
export function dayLabel(day: string | null) {
  if (!day) return null;
  const date = new Date(`${day.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

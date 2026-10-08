export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-30";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

// Empty counts as missing: CI passes unset GitHub variables as "".
function assertValue(v: string | undefined, errorMessage: string): string {
  if (!v || !v.trim()) {
    throw new Error(`${errorMessage}. Set it in .env.local, or as a GitHub Actions variable for CI and deploys (docs/setup/deploy.md).`);
  }
  return v.trim();
}

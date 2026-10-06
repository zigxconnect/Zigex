import { redirect } from "next/navigation";

/** Old address of the reset page; keeps earlier links working. */
export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const query = new URLSearchParams(await searchParams).toString();
  redirect(`/reset-password${query ? `?${query}` : ""}`);
}

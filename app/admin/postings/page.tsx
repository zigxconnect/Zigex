// import { PostingsTable } from "@/app/_components/sections/admin/PostingsTable";
// import { EmptyStatePostings } from "@/app/_components/sections/admin/EmptyStatePostings";

import { PostingsTable } from "@/components/sections/admin/PostingsTable";

export default function PostingsPage() {
  // In a real application, you would fetch data and set this boolean accordingly.
  const hasPostings = true;

  // This logic allows you to switch between the empty and filled states easily.
  if (!hasPostings) {
    // return <EmptyStatePostings />;
  }

  return <PostingsTable />;
}

import React from "react";
import { getPublicProfile, getPublicProfileRow } from "@/lib/api/services/public-profile";
import { slugifyUsername } from "@/lib/utils";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentProfileClient from "@/components/sections/dashboard/StudentProfileClient";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const username = p.username;
  const data = await getPublicProfileRow(username);

  if (!data) return { title: "Student Not Found" };

  const title = `${data.full_name} | Zigex Student`;
  const description = data.about || `View ${data.full_name}'s professional profile and projects on Zigex.`;
  const image = data.cover_image || "https://i.ibb.co/9kLrm6KY/og-image-2x-100-1.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "profile" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);

  // Force slugified URL if non-UUID and contains spaces
  if (!isUuid && username.includes(" ")) {
    redirect(`/profile/${slugifyUsername(username)}`);
  }

  const profile = await getPublicProfile(username);

  if (!profile) {
    console.warn(`[StudentLookup] FAILED for username: ${username}`);
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Student not found</h2>
        <p className="text-muted-foreground mb-4">Could not find a profile for &quot;{username}&quot;</p>
        <p className="text-xs text-muted-foreground">Try searching by the exact full name or ID.</p>
      </div>
    );
  }

  return (
    <StudentProfileClient
      {...profile}
      username={username}
    />
  );
}

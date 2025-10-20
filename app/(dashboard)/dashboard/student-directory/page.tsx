"use server";

import React from "react";
import { getAllUsers } from "@/lib/actions/allusers.actions";
import StudentDirectoryClient from "@/components/sections/dashboard/StudentDirectoryClient";

export default async function StudentDirectoryPage() {
  const profiles = await getAllUsers(200, 0);

  return <StudentDirectoryClient profiles={profiles} />;
}
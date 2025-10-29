"use server";

import React from "react";
import { getAllUsers } from "@/lib/actions/allusers.actions";
import StudentDirectoryClient from "@/components/sections/dashboard/StudentDirectoryClient";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "../../../../components/sections/dashboard/WelcomeCard";

export default async function StudentDirectoryPage() {
  const profiles = await getAllUsers(200, 0);
  const userData = await getProfileInfo();
    console.log("User Data:", userData);

  return <>
    <WelcomeCard user={userData} />
  <StudentDirectoryClient profiles={profiles} />;
  
  </>
}
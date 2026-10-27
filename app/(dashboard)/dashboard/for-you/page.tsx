import { redirect } from "next/navigation";

/** The weekly picks moved into Opportunities; old links and notifications land there. */
export default function ForYouPage() {
  redirect("/feed?view=for-you");
}

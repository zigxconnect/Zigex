import Link from "next/link";
import { landingButton, landingContainer } from "./landing-ui";

/** Closing call to action: one line and one button, after the FAQ answers. */
const CommunitySection = () => {
  return (
    <section aria-labelledby="final-cta-title" className="bg-[#F3F7FF] py-16 sm:py-20">
      <div className={`${landingContainer} flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 id="final-cta-title" className="font-heading text-2xl font-bold tracking-tight text-[#0B1B3F] sm:text-3xl">
            Ready to start your career?
          </h2>
          <p className="mt-2 text-[15px] text-[#4A5670]">It&apos;s free for students and takes two minutes.</p>
        </div>
        <Link href="/sign-up" className={`${landingButton("primary", "lg")} self-start sm:self-auto`}>
          Create your free account
        </Link>
      </div>
    </section>
  );
};

export default CommunitySection;

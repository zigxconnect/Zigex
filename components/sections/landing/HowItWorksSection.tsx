import { landingContainer, landingSectionLead, landingSectionTitle } from "./landing-ui";

// A real sequence, so it is numbered: this is the path every student takes.
const STEPS = [
  {
    title: "Create your profile",
    text: "Add your school, skills and CV once. Every application uses the same profile, so you never retype it.",
  },
  {
    title: "Apply in a few taps",
    text: "Pick an internship, program or event and apply. Follow each application's status from your dashboard.",
  },
  {
    title: "Learn on the job",
    text: "Log your daily work, get feedback from your supervisor and download your logbook when you finish.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="bg-[#F3F7FF] py-16 sm:py-20 scroll-mt-20">
      <div className={landingContainer}>
        <h2 id="how-title" className={landingSectionTitle}>How it works</h2>
        <p className={landingSectionLead}>From sign-up to your first day, in three steps.</p>

        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl bg-white p-6 ring-1 ring-[#DCE5F5]">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#155DFC] font-heading text-base font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold text-[#0B1B3F]">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]">{step.text}</p>
            </li>
          ))}
        </ol>

      </div>
    </section>
  );
}

export default HowItWorksSection;

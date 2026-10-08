import { ChevronDown } from "lucide-react";
import { landingContainer, landingSectionTitle } from "./landing-ui";

// Answers to what students ask before signing up. <details> works without
// JavaScript and is keyboard and screen-reader accessible by default.
// TODO(content): confirm these answers with the team.
const FAQS = [
  {
    q: "Is Zigex free for students?",
    a: "Yes. Creating an account and applying is free. Some programs and internships charge a fee; when they do, it's shown clearly before you apply, and you pay the company directly, never Zigex.",
  },
  {
    q: "Who can apply?",
    a: "Any student or recent graduate aged 18 or over. Most opportunities are in Bamenda and across Cameroon, and some are remote.",
  },
  {
    q: "How do I know a company is real?",
    a: "Companies with a blue verified badge have been checked by the Zigex team. If anything about an opportunity looks wrong, or someone asks you to pay outside the company's official instructions, tell us at zigexconnect.com@gmail.com.",
  },
  {
    q: "Do I get a certificate?",
    a: "Internships and programs end with a certificate of completion, and you can download your logbook of daily work.",
  },
  {
    q: "Can I use Zigex on my phone?",
    a: "Yes. Zigex works in any phone browser. To get it on your home screen like an app, use \"Install the app\" in Settings, or on iPhone tap Share, then Add to Home Screen.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-white py-16 sm:py-20 scroll-mt-20">
      <div className={`${landingContainer} grid gap-10 lg:grid-cols-12`}>
        <h2 id="faq-title" className={`${landingSectionTitle} lg:col-span-4`}>Questions students ask</h2>

        <div className="divide-y divide-[#DCE5F5] border-y border-[#DCE5F5] lg:col-span-8">
          {FAQS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading text-lg font-semibold text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-[#4A5670] transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 pr-9 text-[15px] leading-relaxed text-[#4A5670]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;

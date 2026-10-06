import { landingContainer } from "./landing-ui";

/**
 * About: mission and vision in one compact band (the separate values grid was
 * cut to keep the landing page short).
 */
export const VisionMissionSection = () => {
  return (
    <section id="mission" aria-labelledby="about-title" className="bg-[#F3F7FF] py-16 sm:py-20 scroll-mt-20">
      <div className={`${landingContainer} grid gap-10 lg:grid-cols-12`}>
        <h2 id="about-title" className="font-heading text-3xl font-bold tracking-tight text-[#0B1B3F] sm:text-4xl lg:col-span-4">
          Why Zigex exists
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
          <div>
            <h3 className="font-heading text-lg font-semibold text-[#0B1B3F]">Our mission</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]">
              To bridge the gap between education and industry, so students launch meaningful careers and companies
              discover exceptional local talent.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-[#0B1B3F]">Our vision</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]">
              Every aspiring talent in Bamenda and beyond has direct access to the opportunities that shape the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;

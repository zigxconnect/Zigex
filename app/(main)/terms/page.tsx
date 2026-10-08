import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The rules for using Zigex: accounts, applying to opportunities, what companies agree to, acceptable use, and your rights.",
  path: "/terms",
});

const EMAIL = "zigexconnect.com@gmail.com";
const Mail = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "About these terms",
    body: (
      <>
        <p>
          Zigex is run by <strong>SEED Inc</strong>, Mile 6 Nkwen, Bamenda, Cameroon (&ldquo;SEED&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). These terms apply when you use zigexconnect.com or the Zigex app, as a student, a company or a visitor.
        </p>
        <p>
          By creating an account or using Zigex, you agree to these terms and to our <Link href="/privacy">Privacy Policy</Link>. If you don&apos;t agree, please don&apos;t use Zigex.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use Zigex",
    body: (
      <ul>
        <li>You must be at least 18 years old.</li>
        <li>Give accurate information about yourself, and keep it up to date.</li>
        <li>One person, one student account. Company accounts must be opened by someone allowed to act for that company.</li>
      </ul>
    ),
  },
  {
    id: "account",
    title: "Your account",
    body: (
      <ul>
        <li>Keep your password private, and use one you don&apos;t use elsewhere. You&apos;re responsible for what happens in your account.</li>
        <li>Tell us straight away at <Mail /> if you think someone else is using it.</li>
        <li>You can delete your account at any time in <Link href="/profile-settings">Settings</Link>.</li>
      </ul>
    ),
  },
  {
    id: "students",
    title: "Applying to opportunities",
    body: (
      <>
        <ul>
          <li>Your applications and profile must be truthful: don&apos;t claim skills, qualifications or experience you don&apos;t have, or submit someone else&apos;s work as yours.</li>
          <li>When you apply, the company receives your profile, answers, documents and phone number (see the <Link href="/privacy#who-can-see">Privacy Policy</Link>).</li>
          <li>Companies decide who they accept. Zigex doesn&apos;t guarantee an interview, a place or a job.</li>
          <li>If you&apos;re accepted, follow the company&apos;s rules for the internship, program or event, including attendance and reporting.</li>
        </ul>
        <h3>Programs and events with a fee</h3>
        <p>
          Some programs and events charge a fee, shown before you register. You pay the company that runs it, following its instructions; Zigex doesn&apos;t take payments. Refunds, if any, follow that company&apos;s policy. Never pay anyone who contacts you outside the company&apos;s official instructions, and tell us if someone asks you to.
        </p>
      </>
    ),
  },
  {
    id: "companies",
    title: "Publishing opportunities",
    body: (
      <>
        <p>Companies that publish on Zigex agree to:</p>
        <ul>
          <li>Post only real opportunities they intend to run, with honest descriptions, dates, location and any fee shown clearly.</li>
          <li>Use applicants&apos; information only to review their application and run the opportunity, keep it secure, and not share or sell it.</li>
          <li>Treat applicants fairly and respectfully, and not discriminate unlawfully.</li>
          <li>Reply to applications in a reasonable time, and keep application statuses up to date.</li>
          <li>Never charge students a fee that wasn&apos;t shown on the opportunity.</li>
        </ul>
        <p>We may review, hide or remove opportunities that don&apos;t meet these rules, and remove the &ldquo;verified&rdquo; badge from companies that break them.</p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>Don&apos;t use Zigex to:</p>
        <ul>
          <li>Break the law, or deceive, defraud or impersonate anyone.</li>
          <li>Harass, threaten, bully or discriminate against others.</li>
          <li>Post spam, advertising, pyramid schemes or fake opportunities.</li>
          <li>Collect other people&apos;s information, including by copying profiles or using automated tools to read the site.</li>
          <li>Upload viruses or harmful files, or try to break into accounts or our systems.</li>
          <li>Interfere with how Zigex works, or get around limits we put in place.</li>
        </ul>
      </>
    ),
  },
  {
    id: "content",
    title: "What you post",
    body: (
      <>
        <p>
          You keep ownership of what you add to Zigex (your profile, documents, photos and answers). You give SEED permission to store, display and share it as needed to run Zigex, for example showing your public profile or sending your application to a company. This permission ends when you delete the content or your account, except where we must keep it for the periods in the <Link href="/privacy#how-long">Privacy Policy</Link>.
        </p>
        <p>Only post content you have the right to share. We may remove content that breaks these terms.</p>
        <p>The Zigex name, logo and design belong to SEED. Don&apos;t use them without our permission.</p>
      </>
    ),
  },
  {
    id: "community",
    title: "Community spaces",
    body: (
      <p>
        Zigex links to community chats (Discord and WhatsApp groups). They&apos;re run by those services under their own terms. Be respectful there too; we may remove anyone who breaks these terms from the spaces we manage.
      </p>
    ),
  },
  {
    id: "service",
    title: "Changes to Zigex",
    body: (
      <p>
        We keep improving Zigex, so features may change, and some (marked &ldquo;Soon&rdquo; or &ldquo;In development&rdquo;) aren&apos;t available yet. We work to keep Zigex running but can&apos;t promise it will always be available or free of errors, for example during maintenance or when a provider is down.
      </p>
    ),
  },
  {
    id: "ending",
    title: "Suspending or closing accounts",
    body: (
      <p>
        You can close your account at any time. We may suspend or close an account that breaks these terms, puts others at risk, or is used for fraud. Where reasonable, we&apos;ll tell you why and give you a chance to respond first.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "Our responsibility",
    body: (
      <>
        <p>
          Zigex connects students with companies. The companies, not SEED, are responsible for the opportunities they publish, how they select applicants, and how they run internships, programs and events. We check companies before they get the verified badge, but we can&apos;t guarantee every opportunity.
        </p>
        <p>
          To the extent the law allows, SEED isn&apos;t liable for indirect losses (such as lost earnings or opportunities) arising from your use of Zigex, or for what companies or other users do. Nothing in these terms limits rights you have by law that can&apos;t be limited.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Law and disputes",
    body: (
      <p>
        These terms are governed by the laws of Cameroon. If you have a problem, please contact us first at <Mail />; most issues can be solved quickly. If we can&apos;t resolve it, the competent courts of Bamenda will decide.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms. We&apos;ll change the date at the top and, for important changes, tell you by email or in the app before they apply. If you keep using Zigex after that, the new terms apply.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        SEED Inc, Mile 6 Nkwen, Bamenda, Cameroon. Email: <Mail />.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      effective="8 October 2026"
      intro={<p>These are the rules for using Zigex, for students, companies and visitors. They&apos;re written to be read; the short version comes first.</p>}
      summary={[
        <>Zigex is for people aged 18 and over. Keep your profile and applications truthful.</>,
        <>Companies decide who they accept; Zigex doesn&apos;t guarantee a place or a job.</>,
        <>Fees, when an opportunity has one, are shown up front and paid to the company. Zigex never asks you to pay.</>,
        <>Be respectful, don&apos;t post fake opportunities or spam, and don&apos;t copy other people&apos;s data.</>,
        <>You own what you post and can delete your account at any time.</>,
      ]}
      sections={sections}
      related={{ href: "/privacy", label: "Read the Privacy Policy" }}
    />
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What personal information Zigex collects, who can see it, how long it's kept, and how to see, change or delete it.",
  path: "/privacy",
});

const EMAIL = "zigexconnect.com@gmail.com";
const Mail = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          Zigex is run by <strong>SEED Inc</strong>, Mile 6 Nkwen, Bamenda, Cameroon (&ldquo;SEED&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). SEED is responsible for the personal information described in this policy.
        </p>
        <p>
          This policy covers the Zigex website and app at zigexconnect.com, including the version you install on your phone. Companies that publish opportunities on Zigex decide for themselves what they do with the applications they receive; their own privacy policies apply to that.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <h3>When you create an account</h3>
        <ul>
          <li>Your name and email address, and a password (stored only in a scrambled, one-way form; we can&apos;t read it).</li>
          <li>If you sign in with Google: the name, email address and profile photo Google shares with us. We never see your Google password.</li>
        </ul>
        <h3>Your profile</h3>
        <ul>
          <li>What you choose to add: photo, cover image, username, phone number, town, a short introduction, school, course, degree and graduation year, skills, languages, experience, achievements, interests, preferred way of working, and links (LinkedIn, GitHub, portfolio).</li>
          <li>Optional details some companies ask for: date of birth, grade average, and support you need (for example accessibility needs). Only add these if you want to.</li>
        </ul>
        <h3>When you apply or take part</h3>
        <ul>
          <li>Your answers on the application, documents you attach (CV, cover letter), and the status of each application.</li>
          <li>If you become an intern: your daily check-ins, reports and tasks. When a company uses QR or location check-in, we record the time and, only at the moment you check in, your location, to confirm you were at the workplace.</li>
          <li>Program and event registrations, and payment acknowledgements for programs with a fee (payments themselves are made to the company, not through Zigex).</li>
        </ul>
        <h3>Automatically</h3>
        <ul>
          <li>Basic technical information needed to run and secure the service: IP address, browser and device type, pages requested, and error logs.</li>
          <li>Anonymous usage and speed statistics (which pages are viewed, how fast they load). These don&apos;t identify you and aren&apos;t used for advertising.</li>
          <li>If you turn on notifications: a technical address your browser gives us to deliver them.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use it",
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li><strong>Run your account</strong> and keep you signed in.</li>
          <li><strong>Send your applications</strong> to the companies you choose, and show you their replies.</li>
          <li><strong>Show you relevant opportunities</strong> and remind you of deadlines and events you registered for.</li>
          <li><strong>Run internships and programs</strong>: attendance, reports, tasks and certificates, with the company and supervisor responsible.</li>
          <li><strong>Contact you</strong> about your account, applications and important changes, by email, in the app and (if you turn it on) by notification.</li>
          <li><strong>Keep Zigex safe</strong>: prevent fraud, spam and misuse, and fix problems.</li>
          <li><strong>Improve Zigex</strong>, using statistics that don&apos;t identify you.</li>
        </ul>
        <p>
          We use your information because you asked us to (your account, applications and the features you use), because you agreed (optional details, notifications), because we have a legitimate interest in running a safe service, or because the law requires it.
        </p>
        <p><strong>We don&apos;t sell your personal information, and we don&apos;t use it for advertising.</strong></p>
      </>
    ),
  },
  {
    id: "who-can-see",
    title: "Who can see your information",
    body: (
      <>
        <h3>Other students and visitors</h3>
        <p>
          Your public profile shows your name, photo, cover image, school, course, introduction, skills, experience and links. It never shows your email address, date of birth, grade average or support needs.
        </p>
        <h3>Companies you apply to</h3>
        <p>
          When you apply to an internship, program or event, that company sees your profile, your answers, the documents you attached and your phone number, to review your application and contact you. Companies you haven&apos;t applied to don&apos;t see your phone number or documents.
        </p>
        <h3>Supervisors</h3>
        <p>If you&apos;re an intern, your supervisor and the company see your check-ins, reports and tasks for that internship.</p>
        <h3>Service providers</h3>
        <p>We use trusted providers who process data only on our instructions:</p>
        <ul>
          <li>Hosting and file storage (our servers, Cloudflare, and Supabase for some older images).</li>
          <li>Email delivery (Google Gmail, EmailJS, Resend) and, if you gave a phone number, a WhatsApp messaging provider for a welcome message.</li>
          <li>Notification delivery by your browser&apos;s push service (for example Google, Apple or Mozilla).</li>
          <li>Google, for &ldquo;Continue with Google&rdquo;; Sanity, for announcements content; and Vercel, for anonymous speed statistics.</li>
        </ul>
        <p>
          Community chats (Discord, WhatsApp groups) are run by those services under their own terms; what you post there is shared with the other members.
        </p>
        <h3>When the law requires it</h3>
        <p>We may share information if a court or authority lawfully requires it, or to protect someone&apos;s safety.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and storage on your device",
    body: (
      <>
        <p>We keep this to what Zigex needs to work:</p>
        <ul>
          <li><strong>Sign-in cookie</strong> (<code>zx_access_token</code>): keeps you signed in. It can&apos;t be read by scripts on the page, and it expires on its own.</li>
          <li><strong>Storage in your browser</strong>: unsent application drafts, whether you dismissed a message, and your notification settings. It stays on your device.</li>
          <li><strong>App files</strong>: if you install Zigex, your device keeps a copy of some pages so the app opens quickly and can show an offline page.</li>
        </ul>
        <p>We don&apos;t use advertising or tracking cookies. Blocking the sign-in cookie means you can&apos;t sign in.</p>
      </>
    ),
  },
  {
    id: "how-long",
    title: "How long we keep it",
    body: (
      <ul>
        <li><strong>Your account and profile</strong>: until you delete your account.</li>
        <li><strong>Applications and their documents</strong>: for 2 years after the opportunity closes, so you and the company can refer back to them, then deleted.</li>
        <li><strong>Internship records</strong> (check-ins, reports): for 2 years after the internship ends.</li>
        <li><strong>Inactive accounts</strong>: if you don&apos;t sign in for 3 years, we email you and then delete the account if you don&apos;t reply within 30 days.</li>
        <li><strong>Technical logs</strong>: up to 90 days.</li>
      </ul>
    ),
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    body: (
      <>
        <p>You can:</p>
        <ul>
          <li><strong>See and correct</strong> your information at any time in <Link href="/dashboard/edit-profile">Edit profile</Link>.</li>
          <li><strong>Delete your account</strong> in <Link href="/profile-settings">Settings</Link>. This removes your profile, applications, documents and photos.</li>
          <li><strong>Turn notifications off</strong> in Settings or in your browser.</li>
          <li><strong>Ask for a copy</strong> of your information, ask us to stop using part of it, or ask a question, by emailing <Mail />.</li>
          <li><strong>Withdraw an application</strong> from My applications while it&apos;s still being reviewed.</li>
        </ul>
        <p>
          We answer requests within 30 days, and may ask you to confirm it&apos;s you first. If you think we haven&apos;t handled your information properly, you can also complain to the data protection authority in Cameroon.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: (
      <>
        <p>
          Connections to Zigex are encrypted (HTTPS). Passwords are stored scrambled, the sign-in cookie can&apos;t be read by page scripts, CVs and other documents are only shown through short-lived private links, and access to your data is limited to the people who need it.
        </p>
        <p>
          No service is perfectly secure. Use a password you don&apos;t use elsewhere. If we learn of a breach that affects you, we&apos;ll tell you and the authorities as the law requires.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Where your data is stored",
    body: (
      <p>
        Some of our providers store data in other countries, including in Europe and the United States. When we use them, we require them to protect your information to the same standard as this policy.
      </p>
    ),
  },
  {
    id: "age",
    title: "Age",
    body: <p>Zigex is for people aged 18 and over. We don&apos;t knowingly collect information from anyone younger. If you believe someone under 18 has an account, email <Mail /> and we&apos;ll delete it.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change this policy, we&apos;ll update the date at the top. For important changes we&apos;ll tell you by email or in the app before they take effect.
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

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effective="8 October 2026"
      intro={<p>This explains what personal information Zigex collects, who can see it, how long we keep it, and how you can see, change or delete it.</p>}
      summary={[
        <>We collect what you give us (your account, profile and applications) and the basic technical information needed to run Zigex.</>,
        <>Other students see your public profile. A company sees your application, documents and phone number only when you apply to it.</>,
        <>We never sell your information or use it for advertising.</>,
        <>You can edit your profile at any time and delete your account yourself in Settings.</>,
        <>Questions or requests: <Mail />.</>,
      ]}
      sections={sections}
      related={{ href: "/terms", label: "Read the Terms of Use" }}
    />
  );
}

import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Zigex',
  description: 'Our commitment to protecting your personal information and privacy at Zigex.',
};

export default function PrivacyPolicy() {
  const lastUpdated = "May 24, 2024";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="text-slate-400 text-sm">Last Updated: {lastUpdated}</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Title Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-6">
            <Shield className="text-blue-600" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            At Zigex, your privacy is our priority. We are committed to protecting your personal data and being transparent about how we use it.
          </p>
        </div>

        {/* Content Tabs/Sections */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">

            <section id="introduction">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-blue-500" size={24} />
                <h2 className="text-2xl font-bold">1. Introduction</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                <p>
                  Welcome to Zigex ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (www.zigexconnect.com) and use our platform for internships, skills growth, and professional experience.
                </p>
                <p>
                  By accessing or using Zigex, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>
            </section>

            <section id="collection">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="text-blue-500" size={24} />
                <h2 className="text-2xl font-bold">2. Information We Collect</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li><strong>Personal Identification:</strong> Name, email address, phone number, and location.</li>
                  <li><strong>Professional Information:</strong> Educational background, CVs/resumes, skill sets, and work experience.</li>
                  <li><strong>Account Data:</strong> Username, password, and profile preferences.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform, including search queries and content viewed.</li>
                </ul>
              </div>
            </section>

            <section id="usage">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-blue-500" size={24} />
                <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                <p>We use the collected data to provide, maintain, and improve our services, specifically to:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:border-blue-200">
                    <p className="font-semibold text-slate-900 mb-1">Matching & Applications</p>
                    <p className="text-sm">Connecting students with relevant internships and programs based on their profiles.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:border-blue-200">
                    <p className="font-semibold text-slate-900 mb-1">Communication</p>
                    <p className="text-sm">Sending service updates, security alerts, and administrative messages.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:border-blue-200">
                    <p className="font-semibold text-slate-900 mb-1">Personalization</p>
                    <p className="text-sm">Tailoring your dashboard experience to highlight opportunities that match your career goals.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:border-blue-200">
                    <p className="font-semibold text-slate-900 mb-1">Platform Safety</p>
                    <p className="text-sm">Detecting, investigating, and preventing fraudulent transactions and other illegal activities.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="sharing">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="text-blue-500" size={24} />
                <h2 className="text-2xl font-bold">4. Data Sharing and Disclosure</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                <p>
                  We do not sell your personal information. We may share your information with third-party partners (such as companies offering internships) only when you explicitly apply for an opportunity or join a program.
                </p>
              </div>
            </section>

            <section id="security" className="p-8 bg-blue-600 rounded-3xl text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield size={24} />
                5. Security of Your Information
              </h2>
              <p className="text-blue-50 leading-relaxed">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the information you provide, please be aware that no security measures are perfect or impenetrable.
              </p>
            </section>

            <footer className="pt-12 border-t border-slate-100 text-center">
              <p className="text-slate-500 mb-4 font-medium">Have questions about our privacy practices?</p>
              <a
                href="mailto:privacy@zigex.com"
                className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all hover:scale-105"
              >
                Contact Privacy Team
              </a>
            </footer>

          </div>
        </div>
      </main>
    </div>
  );
}

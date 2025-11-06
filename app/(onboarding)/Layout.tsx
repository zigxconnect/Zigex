/**
 * Onboarding Layout
 * Provides a clean, full-screen white canvas for the entire onboarding flow.
 * overflow-y-auto is a safeguard for very small screens.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-screen bg-white overflow-y-auto">{children}</div>;
}

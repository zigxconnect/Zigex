/**
 * AuthLayout
 * This layout applies ONLY to the routes within the `(auth)` group (e.g., /sign-in).
 *
 * Its existence OVERRIDES the root layout.
 *
 * It provides a minimal structure to center the authentication form on the page,
 * and it intentionally OMITS the main site's Navbar and Footer for a focused
 * user experience.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      {children}
    </div>
  );
}

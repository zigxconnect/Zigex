/**
 * AuthLayout
 * This layout applies to all pages within the (auth) route group.
 * It centers its content on the page, creating a focused view for sign-in or sign-up.
 * Because this layout file exists, the root layout's Navbar and Footer will not be used for these pages.
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

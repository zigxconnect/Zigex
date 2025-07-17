export const metadata = {
  title: "Authentication",
  description: "Sign in or sign up to access your account.",
};
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

import Link from "next/link";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";

// Best practice: Define navigation links in an array for easy mapping and management.
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact Us" },
];

export const Navbar = () => {
  return (
    <header className="py-4 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <Logo isLink={true} />

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" legacyBehavior>
            <a>
              <Button variant="secondary">Sign In</Button>
            </a>
          </Link>
          {/* A mobile menu button would go here, but we'll skip it for now for simplicity. */}
        </div>
      </div>
    </header>
  );
};

import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const navLinks = [
  { label: "Dashboard", href: "/internal" },
  { label: "Quotes", href: "/internal/quotes" },
  { label: "Customers", href: "/internal/customers" },
];

export function InternalNav({ userEmail, userName }: { userEmail: string; userName: string }) {
  return (
    <header className="border-b border-charcoal/10 bg-warm-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/internal" className="font-display text-lg text-charcoal">
            BT Home Designs <span className="text-oak-dark">Internal</span>
          </Link>
          <nav className="hidden gap-6 sm:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[13px] font-medium text-charcoal-soft hover:text-charcoal">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-charcoal-soft sm:inline">
            {userName || userEmail}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

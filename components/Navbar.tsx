"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { services } from "@/lib/data/services";
import { cities } from "@/lib/data/cities";
import { business } from "@/lib/data/business";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

type DropdownItem = { label: string; href: string };

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const serviceItems: DropdownItem[] = services.map((s) => ({ label: s.name, href: `/services/${s.slug}` }));
  const cityItems: DropdownItem[] = cities.slice(0, 8).map((c) => ({ label: `${c.name}, TX`, href: `/service-area/${c.slug}` }));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "bg-warm-white/95 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur" : "bg-warm-white"
      )}
    >
      <nav className="container-lux flex h-20 items-center justify-between md:h-24" aria-label="Primary">
        <Link href="/" aria-label="BT Home Designs home" className="flex flex-col leading-none" onClick={() => setMobileOpen(false)}>
          <span className="font-display text-lg tracking-tight text-charcoal md:text-xl">{business.name.toUpperCase()}</span>
          <span className="eyebrow mt-1 !text-[9px] !tracking-[0.22em] text-charcoal-soft">{business.tagline.toUpperCase()}</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <NavLink href="/" label="Home" active={pathname === "/"} />
          <NavDropdown label="Services" items={serviceItems} viewAllHref="/services" viewAllLabel="View all services" />
          <NavLink href="/gallery" label="Gallery" active={pathname === "/gallery"} />
          <NavDropdown label="Service Area" items={cityItems} viewAllHref="/service-area" viewAllLabel="View all cities" />
          <NavLink href="/about" label="About" active={pathname === "/about"} />
          <NavLink href="/contact" label="Contact" active={pathname === "/contact"} />
        </div>

        <div className="hidden lg:flex">
          <Button href="/quote" size="md" icon={false}>
            Request a Consultation
          </Button>
        </div>

        <button
          ref={mobileToggleRef}
          type="button"
          className="lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-charcoal" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6 text-charcoal" aria-hidden="true" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-warm-white lg:hidden"
          >
            <div className="container-lux flex max-h-[calc(100vh-5rem)] flex-col gap-1 overflow-y-auto pb-8 pt-2">
              <Link href="/" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] font-medium text-charcoal">
                Home
              </Link>
              <p className="eyebrow mb-2 mt-4">Services</p>
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-[15px] text-charcoal-soft"
                >
                  {s.name}
                </Link>
              ))}
              <div className="my-3 hairline" />
              <Link href="/gallery" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] font-medium text-charcoal">
                Gallery
              </Link>
              <div className="my-3 hairline" />
              <p className="eyebrow mb-2">Service Area</p>
              {cities.slice(0, 8).map((c) => (
                <Link
                  key={c.slug}
                  href={`/service-area/${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-[15px] text-charcoal-soft"
                >
                  {c.name}, TX
                </Link>
              ))}
              <Link href="/service-area" onClick={() => setMobileOpen(false)} className="py-2.5 text-[13px] font-medium text-oak-dark">
                View all cities
              </Link>
              <div className="my-3 hairline" />
              {navLinks
                .filter((l) => l.href !== "/" && l.href !== "/gallery")
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-[15px] font-medium text-charcoal"
                  >
                    {link.label}
                  </Link>
                ))}
              <div className="mt-5 flex flex-col gap-3">
                <Button href="/quote" className="w-full justify-center" icon={false}>
                  Request a Consultation
                </Button>
                <a href={`tel:${business.contact.phone}`} className="flex items-center justify-center gap-2 py-2 text-[14px] font-medium text-charcoal">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {business.contact.phoneDisplay}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative pb-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-charcoal-soft transition-colors hover:text-charcoal",
        active && "text-charcoal after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:bg-oak"
      )}
    >
      {label}
    </Link>
  );
}

function NavDropdown({
  label,
  items,
  viewAllHref,
  viewAllLabel,
}: {
  label: string;
  items: DropdownItem[];
  viewAllHref: string;
  viewAllLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = `nav-dropdown-${label.toLowerCase().replace(/\s+/g, "-")}`;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-charcoal-soft transition-colors hover:text-charcoal"
      >
        {label} <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full max-h-[70vh] w-72 -translate-x-1/2 overflow-y-auto pt-4"
          >
            <div className="rounded-sm border border-charcoal/10 bg-warm-white p-3 shadow-xl">
              {items.map((item) => (
                <Link
                  key={item.href}
                  role="menuitem"
                  href={item.href}
                  className="block rounded-sm px-4 py-2.5 text-[13px] text-charcoal-soft transition-colors hover:bg-cream hover:text-charcoal"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-1 border-t border-charcoal/10 pt-2">
                <Link role="menuitem" href={viewAllHref} className="block rounded-sm px-4 py-2.5 text-[13px] font-medium text-oak-dark hover:bg-cream">
                  {viewAllLabel}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

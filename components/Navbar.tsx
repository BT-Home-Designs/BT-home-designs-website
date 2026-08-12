"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { services } from "@/lib/data/services";
import { business } from "@/lib/data/business";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Service Area", href: "/service-area" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesWrapRef = useRef<HTMLDivElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
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

  // Escape closes whichever menu is open, and returns focus to its trigger.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (servicesOpen) {
        setServicesOpen(false);
        servicesButtonRef.current?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [servicesOpen, mobileOpen]);

  // Close the services dropdown when focus leaves it entirely (keyboard nav).
  const handleServicesBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!servicesWrapRef.current?.contains(e.relatedTarget as Node | null)) {
      setServicesOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "bg-warm-white/95 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur" : "bg-transparent"
      )}
    >
      <nav className="container-lux flex h-20 items-center justify-between md:h-24" aria-label="Primary">
        <Link href="/" aria-label="BT Home Designs home" className="flex flex-col leading-none" onClick={() => setMobileOpen(false)}>
          <span
            className={cn(
              "font-display text-xl tracking-tight md:text-2xl",
              scrolled ? "text-charcoal" : "text-warm-white"
            )}
          >
            {business.name}
          </span>
          <span
            className={cn(
              "eyebrow mt-0.5 !text-[9px] !tracking-[0.28em]",
              scrolled ? "text-oak-dark" : "text-oak-light"
            )}
          >
            {business.tagline}
          </span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          <div
            ref={servicesWrapRef}
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
            onBlur={handleServicesBlur}
          >
            <button
              ref={servicesButtonRef}
              type="button"
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              aria-controls="services-menu"
              onClick={() => setServicesOpen((v) => !v)}
              onFocus={() => setServicesOpen(true)}
              className={cn(
                "flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors",
                scrolled ? "text-charcoal hover:text-oak-dark" : "text-warm-white hover:text-oak-light"
              )}
            >
              Services <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  id="services-menu"
                  role="menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4"
                >
                  <div className="rounded-sm border border-charcoal/10 bg-warm-white p-3 shadow-xl">
                    {services.map((s) => (
                      <Link
                        key={s.slug}
                        role="menuitem"
                        href={`/services/${s.slug}`}
                        className="block rounded-sm px-4 py-2.5 text-[13px] text-charcoal-soft transition-colors hover:bg-cream hover:text-charcoal"
                      >
                        {s.name}
                      </Link>
                    ))}
                    <div className="mt-1 border-t border-charcoal/10 pt-2">
                      <Link
                        role="menuitem"
                        href="/services"
                        className="block rounded-sm px-4 py-2.5 text-[13px] font-medium text-oak-dark hover:bg-cream"
                      >
                        View all services
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13px] font-medium tracking-wide transition-colors",
                scrolled ? "text-charcoal hover:text-oak-dark" : "text-warm-white hover:text-oak-light"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${business.contact.phone}`}
            className={cn(
              "flex items-center gap-2 text-[13px] font-medium",
              scrolled ? "text-charcoal" : "text-warm-white"
            )}
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {business.contact.phoneDisplay}
          </a>
          <Button href="/quote" size="md">
            Get Free Consultation
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
            <Menu className={cn("h-6 w-6", scrolled ? "text-charcoal" : "text-warm-white")} aria-hidden="true" />
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
            <div className="container-lux flex flex-col gap-1 pb-8 pt-2">
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-[15px] text-charcoal"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-5 flex flex-col gap-3">
                <Button href="/quote" className="w-full justify-center">
                  Get Free Consultation
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

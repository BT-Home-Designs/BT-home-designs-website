import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type ButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light" | "accent";
  size?: "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  icon?: boolean;
  disabled?: boolean;
};

export function Button({
  href,
  onClick,
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  icon = true,
  disabled,
}: ButtonProps) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-matte-black text-warm-white hover:bg-oak-dark",
    secondary: "border border-charcoal/25 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-warm-white",
    ghost: "text-charcoal hover:text-oak-dark underline-offset-4 hover:underline",
    light: "bg-warm-white text-charcoal hover:bg-cream",
    // For CTA buttons that sit on a dark (bg-matte-black/bg-charcoal)
    // section, where the "primary" variant's dark fill would blend into
    // the background and become nearly invisible.
    accent: "bg-oak text-warm-white hover:bg-oak-dark",
  };

  const sizes = {
    md: "px-6 py-3 text-[13px]",
    lg: "px-8 py-4 text-sm",
  };

  const content = (
    <>
      {children}
      {icon && variant !== "ghost" && (
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
      )}
    </>
  );

  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {content}
    </button>
  );
}

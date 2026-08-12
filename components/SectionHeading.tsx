import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className={cn("eyebrow mb-4", tone === "light" && "text-oak-light")}>{eyebrow}</p>
      )}
      <h2
        className={cn(
          "text-3xl leading-[1.15] md:text-[2.75rem]",
          tone === "light" ? "text-warm-white" : "text-charcoal"
        )}
      >
        {title}
      </h2>
      {copy && (
        <p className={cn("mt-5 text-[15px] leading-relaxed", tone === "light" ? "text-warm-white/70" : "text-charcoal-soft")}>
          {copy}
        </p>
      )}
    </div>
  );
}

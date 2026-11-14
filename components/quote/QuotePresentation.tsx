"use client";

/* eslint-disable @next/next/no-img-element -- quote photos are private, auth-checked API responses; next/image's optimizer would cache them publicly */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X, Check, ExternalLink, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { formatCents } from "@/lib/quotes/money";
import { formatDate, formatDateTime, formatQty } from "@/lib/quotes/format";
import type { CustomerQuoteView } from "@/lib/quotes/view";
import { cn } from "@/lib/utils";
import { StatusPill } from "./StatusPill";

type Props = { view: CustomerQuoteView; token?: string };

type Slide = { key: string; label: string; render: () => ReactNode };

const LOGO = "/images/brand/bt-logo-240.png";

export function QuotePresentation({ view, token }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lightbox, setLightbox] = useState<{ photos: CustomerQuoteView["pages"][number]["photos"]; i: number } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null) as React.RefObject<HTMLHeadingElement>;
  const touch = useRef<{ x: number; y: number; ignore: boolean } | null>(null);
  const firstRender = useRef(true);

  const slides: Slide[] = useMemo(() => {
    const list: Slide[] = [{ key: "cover", label: "Welcome", render: () => <CoverSlide view={view} headingRef={headingRef} /> }];
    view.pages.forEach((page) =>
      list.push({
        key: page.id,
        label: page.title || page.room || "Design",
        render: () => <DesignSlide view={view} page={page} headingRef={headingRef} onPhoto={(i) => setLightbox({ photos: page.photos, i })} />,
      })
    );
    list.push({ key: "pricing", label: "Pricing", render: () => <PricingSlide view={view} headingRef={headingRef} /> });
    if (view.terms.length) list.push({ key: "terms", label: "Terms", render: () => <TermsSlide view={view} headingRef={headingRef} /> });
    list.push({ key: "approve", label: "Approve & Pay", render: () => <ApproveSlide view={view} token={token} headingRef={headingRef} /> });
    return list;
  }, [view, token]);

  const last = slides.length - 1;
  const safeIndex = Math.min(index, last);

  const go = useCallback(
    (next: number) => {
      const target = Math.max(0, Math.min(last, next));
      if (target === safeIndex) return;
      setDirection(target > safeIndex ? 1 : -1);
      setIndex(target);
    },
    [safeIndex, last]
  );

  // Opening a quote always starts at the top of the first page.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // On page change: back to the top of the new page, focus its heading for screen readers.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    headingRef.current?.focus({ preventScroll: true });
  }, [safeIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowRight") go(safeIndex + 1);
      if (e.key === "ArrowLeft") go(safeIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, safeIndex, lightbox]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const el = e.target as HTMLElement;
    touch.current = { x: t.clientX, y: t.clientY, ignore: Boolean(el.closest("input,textarea,button,a,[data-noswipe]")) };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || start.ignore || lightbox) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) go(safeIndex + (dx < 0 ? 1 : -1));
  };

  const approveIndex = last;

  return (
    <div className="flex min-h-dvh flex-col bg-bt-cream text-charcoal">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-bt-gold/30 bg-bt-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <img src={LOGO} alt="BT Home Designs" className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] text-bt-green sm:text-base">{view.projectName || "Your Quote"}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.14em] text-charcoal-soft">Quote {view.number}</p>
          </div>
          <StatusPill status={view.isPreview ? "draft" : view.status} label={view.statusLabel} className="hidden sm:inline-flex" />
          {view.canApprove && safeIndex !== approveIndex && (
            <button
              type="button"
              onClick={() => go(approveIndex)}
              className="hidden rounded-sm bg-bt-green px-3.5 py-2 text-[12px] font-semibold tracking-wide text-bt-cream hover:bg-bt-green-deep md:inline-flex"
            >
              Approve Quote
            </button>
          )}
          <a
            href={view.pdfUrl}
            className="inline-flex items-center gap-1.5 rounded-sm border border-bt-green/30 px-3 py-2 text-[12px] font-semibold tracking-wide text-bt-green hover:bg-bt-green hover:text-bt-cream"
          >
            <Download className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </a>
        </div>
      </header>

      {(view.isSample || view.isPreview) && (
        <div className="bg-[#7a5d17] px-4 py-2 text-center text-[12px] font-medium text-white">
          {view.isPreview && "Owner preview of the current draft — not visible to the customer. Actions are disabled. "}
          {view.isSample && "SAMPLE QUOTE — demo data only, not a real customer. Payment links point to Square's sandbox."}
        </div>
      )}

      {/* Slide */}
      {/* The root layout already provides <main>; this is the swipeable slide area. */}
      <div className="flex-1" data-slide-area onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
          <div className="relative overflow-hidden rounded-md border border-bt-gold/25 bg-[#fbf9f3] shadow-[0_20px_60px_-30px_rgba(27,46,34,0.35)] lg:min-h-[620px]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.section
                key={slides[safeIndex].key}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                aria-roledescription="slide"
                aria-label={`${safeIndex + 1} of ${slides.length}: ${slides[safeIndex].label}`}
              >
                {slides[safeIndex].render()}
              </motion.section>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Quote pages" className="sticky bottom-0 z-30 border-t border-bt-gold/30 bg-bt-cream/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={() => go(safeIndex - 1)}
            disabled={safeIndex === 0}
            className="inline-flex h-11 items-center gap-1 rounded-sm border border-bt-green/30 px-3 text-sm font-medium text-bt-green transition hover:bg-bt-green hover:text-bt-cream disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Jump to page">
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  aria-label={`Page ${i + 1}: ${s.label}`}
                  title={s.label}
                  onClick={() => go(i)}
                  className="group flex h-6 items-center justify-center px-0.5"
                >
                  <span
                    className={cn(
                      "block h-2 rounded-full transition-all",
                      i === safeIndex ? "w-6 bg-bt-gold" : "w-2 bg-bt-green/25 group-hover:bg-bt-green/50"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="max-w-full truncate text-[11px] uppercase tracking-[0.14em] text-charcoal-soft" aria-live="polite">
              {safeIndex + 1} / {slides.length} · {slides[safeIndex].label}
            </p>
          </div>

          {safeIndex < last ? (
            <button
              type="button"
              onClick={() => go(safeIndex + 1)}
              className="inline-flex h-11 items-center gap-1 rounded-sm bg-bt-green px-3 text-sm font-medium text-bt-cream transition hover:bg-bt-green-deep sm:px-4"
            >
              <span className="hidden sm:inline">{safeIndex + 1 === last ? "Approve & Pay" : "Next"}</span>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          ) : (
            <span className="inline-flex h-11 w-11 sm:w-[104px]" aria-hidden />
          )}
        </div>
      </nav>

      {lightbox && <Lightbox photos={lightbox.photos} start={lightbox.i} onClose={() => setLightbox(null)} />}
    </div>
  );
}

// ------------------------------------------------------------ slide pieces

type HeadingRef = React.RefObject<HTMLHeadingElement>;

function GoldRule({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-bt-gold", className)} aria-hidden>
      <span className="h-px flex-1 bg-bt-gold/60" />
      <span className="h-2 w-2 rotate-45 bg-bt-gold" />
      <span className="h-px flex-1 bg-bt-gold/60" />
    </div>
  );
}

function SlideTitle({ headingRef, eyebrow, children }: { headingRef: HeadingRef; eyebrow?: string; children: ReactNode }) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className="font-display text-[28px] leading-tight text-bt-green outline-none sm:text-4xl">
        {children}
      </h1>
      {eyebrow && <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-bt-gold">{eyebrow}</p>}
    </div>
  );
}

function CoverSlide({ view, headingRef }: { view: CustomerQuoteView; headingRef: HeadingRef }) {
  const meta: [string, string][] = [
    ["Prepared for", view.customerName],
    ["Quote", view.number],
    ["Date", formatDate(view.quoteDate)],
    ["Valid until", formatDate(view.expirationDate)],
  ];
  return (
    <div className="grid lg:min-h-[620px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="relative min-h-[200px] bg-bt-green sm:min-h-[280px]">
        {view.coverPhotoUrl ? (
          <>
            <img src={view.coverPhotoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-bt-green-deep/70 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={LOGO} alt="" className="h-40 w-40 rounded-full ring-2 ring-bt-gold/60" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 lg:px-14">
        <img src={LOGO} alt="BT Home Designs" className="mb-5 h-16 w-16 rounded-full ring-1 ring-bt-gold/60" />
        <GoldRule className="mb-5 max-w-md" />
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-[34px] leading-[1.05] text-bt-green outline-none sm:text-5xl">
          {view.projectName || view.customerName}
        </h1>
        {view.coverTitle && <p className="mt-2 font-display text-xl text-charcoal sm:text-2xl">{view.coverTitle}</p>}
        {view.treatments.length > 0 && (
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-bt-gold">{view.treatments.join(" + ")}</p>
        )}
        <GoldRule className="my-5 max-w-md" />
        {view.intro && <p className="max-w-xl whitespace-pre-line text-[15px] leading-relaxed text-charcoal-soft">{view.intro}</p>}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bt-gold">{k}</dt>
                <dd className="mt-0.5 text-sm text-charcoal">{v}</dd>
              </div>
            ))}
        </dl>
        {view.expired && !view.approval && (
          <p className="mt-5 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            This quote&apos;s expiration date has passed. Please contact BT Home Designs for an updated quote.
          </p>
        )}
        <p className="mt-7 text-[12px] text-charcoal-soft">Use the arrows below (or swipe) to page through your design, selections, and pricing.</p>
      </div>
    </div>
  );
}

function DesignSlide({
  view,
  page,
  headingRef,
  onPhoto,
}: {
  view: CustomerQuoteView;
  page: CustomerQuoteView["pages"][number];
  headingRef: HeadingRef;
  onPhoto: (i: number) => void;
}) {
  const [hero, ...rest] = page.photos;
  return (
    <div className="grid lg:min-h-[620px] lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="hidden flex-col bg-bt-green px-6 py-8 text-bt-cream lg:flex">
        <img src={LOGO} alt="" className="h-24 w-24 rounded-full ring-1 ring-bt-gold/60" />
        <p className="mt-6 font-display text-xl leading-snug">{view.projectName}</p>
        {page.room && <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-bt-cream/80">{page.room}</p>}
        {page.treatment && <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-bt-gold-light">{page.treatment}</p>}
      </aside>
      <div className="px-5 py-6 sm:px-9 sm:py-9">
        <SlideTitle headingRef={headingRef} eyebrow={[page.room, page.treatment].filter(Boolean).join(" · ")}>
          {page.title || page.room}
        </SlideTitle>
        <GoldRule className="my-5" />
        <div className={cn("grid gap-7", page.photos.length > 0 && "md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]")}>
          <div>
            {page.description && <p className="whitespace-pre-line text-[15px] leading-relaxed text-charcoal-soft">{page.description}</p>}
            {page.selections.length > 0 && (
              <dl className={cn("divide-y divide-bt-gold/20 border-y border-bt-gold/20", page.description && "mt-5")}>
                {page.selections.map((s, i) => (
                  <div key={i} className="grid grid-cols-[minmax(92px,34%)_1fr] gap-3 py-2.5">
                    <dt className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-bt-gold">{s.label}</dt>
                    <dd className="whitespace-pre-line text-[14px] leading-snug text-charcoal">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {hero && (
            <div className="space-y-3" data-noswipe>
              <PhotoTile photo={hero} onClick={() => onPhoto(0)} large />
              {rest.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {rest.map((p, i) => (
                    <PhotoTile key={p.id + i} photo={p} onClick={() => onPhoto(i + 1)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PhotoTile({ photo, onClick, large }: { photo: { url: string; caption: string; selected: boolean }; onClick: () => void; large?: boolean }) {
  return (
    <figure>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative block w-full overflow-hidden rounded-sm bg-cream",
          large ? "aspect-[4/3]" : "aspect-square",
          photo.selected ? "ring-2 ring-bt-gold ring-offset-2 ring-offset-[#fbf9f3]" : "ring-1 ring-charcoal/10"
        )}
        aria-label={`Enlarge photo${photo.caption ? `: ${photo.caption}` : ""}`}
      >
        <img src={photo.url} alt={photo.caption || ""} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" loading="lazy" />
        {photo.selected && (
          <span className="absolute left-2 top-2 rounded-sm bg-bt-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Selected</span>
        )}
      </button>
      {photo.caption && (
        <figcaption className={cn("mt-1.5 text-center text-[12px] leading-tight", photo.selected ? "font-semibold text-[#8a6a1d]" : "text-charcoal-soft")}>
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

function PricingSlide({ view, headingRef }: { view: CustomerQuoteView; headingRef: HeadingRef }) {
  const t = view.totals;
  return (
    <div className="px-5 py-6 sm:px-9 sm:py-9">
      <SlideTitle headingRef={headingRef} eyebrow={[view.projectName, view.number].filter(Boolean).join(" | ")}>
        Final Pricing
      </SlideTitle>
      <GoldRule className="my-5" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <ul className="divide-y divide-bt-gold/20 border-b border-bt-gold/20">
          {view.lineItems.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                {item.room && <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-bt-gold">{item.room}</p>}
                <p className="text-[15px] leading-snug text-charcoal">{item.description}</p>
                {item.quantity !== 1 && (
                  <p className="mt-0.5 text-[12px] text-charcoal-soft">
                    {formatQty(item.quantity)} × {formatCents(item.unitPriceCents)}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-[15px] font-semibold tabular-nums">{formatCents(item.totalCents)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <dl className="space-y-2 text-[15px]">
            <Row label="Subtotal" value={formatCents(t.subtotalCents)} />
            <Row label={`Tax (${t.taxRatePercent}%)`} value={formatCents(t.taxCents)} />
          </dl>
          <div className="rounded-md bg-bt-green px-5 py-5 text-center text-bt-cream">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-bt-gold-light">Project Total</p>
            <p className="mt-1 font-display text-4xl tabular-nums">{formatCents(t.totalCents)}</p>
          </div>
          <BalanceBox view={view} />
        </div>
      </div>
    </div>
  );
}

function BalanceBox({ view }: { view: CustomerQuoteView }) {
  const t = view.totals;
  return (
    <dl className="space-y-2 rounded-md border border-bt-gold/40 bg-white/60 px-4 py-4 text-[14px]">
      {t.depositCents > 0 && <Row label="Deposit required" value={formatCents(t.depositCents)} strong />}
      <Row label="Payments received" value={formatCents(t.paidCents)} />
      {view.payments.map((p, i) => (
        <Row key={i} label={`  ${formatDate(p.date)}`} value={formatCents(p.amountCents)} muted />
      ))}
      <div className="border-t border-bt-gold/30 pt-2">
        <Row label="Remaining balance" value={formatCents(Math.max(0, t.remainingCents))} strong />
      </div>
      <p className="pt-1 text-[11px] leading-snug text-charcoal-soft">
        Payments appear here once BT Home Designs confirms and records them.
      </p>
    </dl>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", muted && "text-[12px] text-charcoal-soft")}>
      <dt className={cn(strong && "font-semibold text-bt-green", "whitespace-pre")}>{label}</dt>
      <dd className={cn("tabular-nums", strong && "font-semibold text-bt-green")}>{value}</dd>
    </div>
  );
}

function TermsSlide({ view, headingRef }: { view: CustomerQuoteView; headingRef: HeadingRef }) {
  return (
    <div className="px-5 py-6 sm:px-9 sm:py-9">
      <SlideTitle headingRef={headingRef} eyebrow={view.projectName}>
        Terms &amp; Project Agreement
      </SlideTitle>
      <GoldRule className="my-5" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {view.terms.map((t) => (
          <section key={t.id} className="rounded-xl border border-bt-gold/60 bg-white/50 px-5 py-4">
            {t.title && <h2 className="font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-bt-green">{t.title}</h2>}
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-charcoal-soft">{t.body}</p>
          </section>
        ))}
      </div>
      {view.approvalStatement && (
        <p className="mt-5 whitespace-pre-line rounded-xl border border-bt-gold/60 px-5 py-4 text-[14px] leading-relaxed text-charcoal">
          {view.approvalStatement}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------- approve & pay

function ApproveSlide({ view, token, headingRef }: { view: CustomerQuoteView; token?: string; headingRef: HeadingRef }) {
  const t = view.totals;
  const [showChanges, setShowChanges] = useState(false);
  return (
    <div className="px-5 py-6 sm:px-9 sm:py-9">
      <SlideTitle headingRef={headingRef} eyebrow={`${view.projectName} | Quote ${view.number}`}>
        Approve &amp; Pay
      </SlideTitle>
      <GoldRule className="my-5" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
        <div className="space-y-4">
          <div className="rounded-md bg-bt-green px-5 py-5 text-bt-cream">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-bt-gold-light">Project Total</p>
              <StatusPill status={view.isPreview ? "draft" : view.status} label={view.statusLabel} className="bg-bt-cream text-bt-green" />
            </div>
            <p className="mt-1 font-display text-4xl tabular-nums">{formatCents(t.totalCents)}</p>
          </div>
          <BalanceBox view={view} />
        </div>

        <div className="space-y-6">
          <ApprovalPanel view={view} token={token} />

          <section aria-labelledby="pay-heading" className="rounded-md border border-bt-gold/40 bg-white/60 px-5 py-5">
            <h2 id="pay-heading" className="font-sans text-[13px] font-bold uppercase tracking-[0.1em] text-bt-green">
              Payment
            </h2>
            {view.paymentButtons.length > 0 ? (
              <>
                <div className="mt-3 flex flex-wrap gap-3">
                  {view.paymentButtons.map((b, i) => (
                    <a
                      key={b.kind}
                      href={view.isPreview ? undefined : b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={view.isPreview || undefined}
                      onClick={view.isPreview ? (e) => e.preventDefault() : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold tracking-wide transition",
                        i === 0 ? "bg-bt-gold text-white hover:bg-[#a7832f]" : "border border-bt-green/40 text-bt-green hover:bg-bt-green hover:text-bt-cream",
                        view.isPreview && "cursor-not-allowed opacity-60"
                      )}
                    >
                      {b.label}
                      {b.kind === "deposit" && t.depositDueCents > 0 && <span className="font-normal opacity-90">· {formatCents(t.depositDueCents)}</span>}
                      {b.kind !== "deposit" && <span className="font-normal opacity-90">· {formatCents(t.remainingCents)}</span>}
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-snug text-charcoal-soft">
                  Opens BT Home Designs&apos; secure Square payment page in a new tab. Your balance here updates after BT Home Designs confirms your payment.
                </p>
              </>
            ) : (
              <p className="mt-2 text-[14px] text-charcoal-soft">
                {t.remainingCents <= 0 && t.totalCents > 0
                  ? "Paid in full — thank you!"
                  : view.paymentsAwaitApproval
                    ? "Payment options will appear here after you approve the quote."
                    : "BT Home Designs will send your payment link separately."}
              </p>
            )}
          </section>

          <section className="rounded-md border border-bt-gold/40 bg-white/60 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-sans text-[13px] font-bold uppercase tracking-[0.1em] text-bt-green">Need something changed?</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowChanges((s) => !s)}
                  aria-expanded={showChanges}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-bt-green/40 px-4 py-2 text-sm font-semibold text-bt-green hover:bg-bt-green hover:text-bt-cream"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden />
                  Request Changes
                </button>
                <a
                  href={view.pdfUrl}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-bt-green/40 px-4 py-2 text-sm font-semibold text-bt-green hover:bg-bt-green hover:text-bt-cream"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download PDF
                </a>
              </div>
            </div>
            {showChanges && <ChangeRequestForm view={view} token={token} />}
          </section>
        </div>
      </div>
    </div>
  );
}

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true } : { ok: false, error: data.error || "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}

function ApprovalPanel({ view, token }: { view: CustomerQuoteView; token?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);

  if (view.approval) {
    return (
      <div ref={msgRef} tabIndex={-1} role="status" className="rounded-md border border-bt-green/30 bg-bt-green/5 px-5 py-5 outline-none">
        <p className="flex items-center gap-2 font-display text-xl text-bt-green">
          <Check className="h-5 w-5" aria-hidden /> Quote approved
        </p>
        <p className="mt-1 text-[14px] text-charcoal-soft">
          Approved by <strong className="text-charcoal">{view.approval.name}</strong> on {formatDateTime(view.approval.at)} (version {view.approval.version}).
        </p>
        <p className="mt-2 text-[14px] font-semibold text-bt-green">Status: {view.statusLabel}</p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreed) return setError("Please confirm you've reviewed the quote and terms.");
    if (name.trim().length < 2) return setError("Please type your full name.");
    if (!token) return;
    setBusy(true);
    const res = await postJson(`/api/q/${token}/approve`, { name, agree: true, version: view.version, scopeHash: view.scopeHash });
    setBusy(false);
    if (!res.ok) return setError(res.error!);
    router.refresh(); // re-renders in place; stays on this page, no scroll jump
  };

  const disabled = !view.canApprove || view.isPreview;
  return (
    <form onSubmit={submit} className="rounded-md border border-bt-gold/60 bg-white/70 px-5 py-5" noValidate>
      <h2 className="font-sans text-[13px] font-bold uppercase tracking-[0.1em] text-bt-green">Approve this quote</h2>
      {view.hasSupersededApproval && (
        <p className="mt-2 rounded-sm bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
          This quote was updated after your earlier approval. Please review the changes and approve the updated version.
        </p>
      )}
      {view.expired ? (
        <p className="mt-2 text-[14px] text-red-800">This quote has expired. Please contact BT Home Designs for an updated quote.</p>
      ) : (
        <>
          {view.approvalStatement && <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-charcoal-soft">{view.approvalStatement}</p>}
          <label className="mt-4 flex items-start gap-3 text-[14px] leading-snug">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={disabled}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--bt-green)]"
            />
            <span>
              I have reviewed this quote{view.terms.length ? ", including the terms," : ""} and approve it (version {view.version}, total {formatCents(view.totals.totalCents)}).
            </span>
          </label>
          <label className="mt-4 block text-[12px] font-semibold uppercase tracking-[0.12em] text-charcoal-soft" htmlFor="approve-name">
            Your full name
          </label>
          <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
            <input
              id="approve-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={disabled}
              autoComplete="name"
              maxLength={120}
              className="min-h-11 flex-1 rounded-sm border border-charcoal/25 bg-white px-3 text-[16px] focus:border-bt-green focus:outline-none"
            />
            <button
              type="submit"
              disabled={disabled || busy}
              className="min-h-11 rounded-sm bg-bt-green px-6 text-sm font-semibold tracking-wide text-bt-cream hover:bg-bt-green-deep disabled:opacity-50"
            >
              {busy ? "Saving…" : "Approve Quote"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-[13px] text-red-700">
              {error}
            </p>
          )}
          {view.isPreview && <p className="mt-3 text-[12px] text-charcoal-soft">Disabled in owner preview.</p>}
        </>
      )}
    </form>
  );
}

function ChangeRequestForm({ view, token }: { view: CustomerQuoteView; token?: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done)
    return (
      <p role="status" className="mt-4 rounded-sm bg-bt-green/5 px-4 py-3 text-[14px] text-bt-green">
        Thanks — your change request was sent to BT Home Designs. We&apos;ll follow up with an updated quote.
      </p>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) return;
    setBusy(true);
    const res = await postJson(`/api/q/${token}/changes`, { name, message });
    setBusy(false);
    if (!res.ok) return setError(res.error!);
    setDone(true);
  };

  const disabled = view.isPreview || !token;
  return (
    <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
      <div>
        <label htmlFor="cr-name" className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-charcoal-soft">
          Your name
        </label>
        <input
          id="cr-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          disabled={disabled}
          className="mt-1.5 min-h-11 w-full rounded-sm border border-charcoal/25 bg-white px-3 text-[16px] focus:border-bt-green focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="cr-msg" className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-charcoal-soft">
          What would you like changed?
        </label>
        <textarea
          id="cr-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={5000}
          disabled={disabled}
          className="mt-1.5 w-full rounded-sm border border-charcoal/25 bg-white px-3 py-2 text-[16px] focus:border-bt-green focus:outline-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || disabled}
        className="min-h-11 rounded-sm bg-bt-green px-5 text-sm font-semibold text-bt-cream hover:bg-bt-green-deep disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send Change Request"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- lightbox

function Lightbox({ photos, start, onClose }: { photos: { url: string; caption: string; selected: boolean }[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % photos.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus({ preventScroll: true });
    };
  }, [onClose, photos.length]);
  const p = photos[i];
  return (
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 flex flex-col bg-black/90" onClick={onClose}>
      <div className="flex justify-end p-3">
        <button ref={closeRef} type="button" onClick={onClose} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Close photo">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 pb-6" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 && (
          <button type="button" onClick={() => setI((i - 1 + photos.length) % photos.length)} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Previous photo">
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}
        <figure className="flex max-h-full min-w-0 flex-1 flex-col items-center">
          <img src={p.url} alt={p.caption} className="max-h-[78dvh] max-w-full rounded-sm object-contain" />
          {(p.caption || p.selected) && (
            <figcaption className="mt-3 text-center text-sm text-white/90">
              {p.selected && <span className="mr-2 rounded-sm bg-bt-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Selected</span>}
              {p.caption}
            </figcaption>
          )}
        </figure>
        {photos.length > 1 && (
          <button type="button" onClick={() => setI((i + 1) % photos.length)} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Next photo">
            <ChevronRight className="h-7 w-7" />
          </button>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Camera, ClipboardList, Info, Ruler, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { Accordion } from "@/components/Accordion";
import { MeasurementWorksheet } from "@/components/MeasurementWorksheet";
import { business } from "@/lib/data/business";

/**
 * How to Measure — customer measuring guide for preliminary quotes.
 *
 * CONTENT ACCURACY: these are data-collection instructions only. Do not add
 * deductions, overlap/stackback amounts, minimum depths, mounting heights,
 * or rounding rules here — those vary by product and manufacturer and are
 * decided by BT Home Designs at the professional measure. Diagrams live in
 * public/images/measuring/ and their letters must match the lists below.
 */

const PAGE_PATH = "/how-to-measure";
const TITLE = "How to Measure for Custom Window Treatments";
const DESCRIPTION =
  "Measure your windows for a custom window treatment quote: inside vs. outside mount, drapery, Roman shades, and valances, with clear diagrams and a worksheet.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: `${TITLE} | ${business.name}`,
    description: DESCRIPTION,
    url: PAGE_PATH,
  },
};

const img = (name: string) => `/images/measuring/${name}.svg`;

const onThisPage = [
  { href: "#before-you-start", label: "Before you start" },
  { href: "#mount-types", label: "Inside vs. outside mount" },
  { href: "#drapery", label: "Drapery & curtains" },
  { href: "#roman-shades", label: "Roman shades" },
  { href: "#valances", label: "Valances" },
  { href: "#other-products", label: "Other products" },
  { href: "#worksheet", label: "Worksheet" },
  { href: "#faq", label: "FAQ" },
];

const beforeYouStart = [
  {
    icon: Ruler,
    title: "Use a steel tape measure",
    copy: "A metal tape stays straight and doesn't stretch. Cloth sewing tapes and rulers can throw your numbers off.",
  },
  {
    icon: ClipboardList,
    title: "Record everything in inches",
    copy: "Write down exactly where the tape lands, fractions included — for example 35 ⅜, not \"about 35.\"",
  },
  {
    icon: Ruler,
    title: "Write width × height",
    copy: "Width (side to side) always comes first, then height (top to bottom): 36 ⅜ × 60 ½.",
  },
  {
    icon: Tag,
    title: "Label each window by room",
    copy: "Give every window its own name, like \"Kitchen – over sink\" or \"Primary bedroom – left,\" so nothing gets mixed up.",
  },
  {
    icon: Camera,
    title: "Take a straight-on photo",
    copy: "Stand back and face the window squarely so we can see the whole window, the trim, and the wall around it.",
  },
];

const insideMountSteps = [
  {
    title: "Place the tape inside the opening",
    copy: "Hook the end of the tape against one inside side wall of the opening (the \"jamb\") and pull it straight across to the other side. Keep the tape level, not angled.",
  },
  {
    title: "Measure the width in three places",
    copy: "Take a width reading near the top, one in the middle, and one near the bottom of the opening. Write down all three.",
  },
  {
    title: "Measure the height in three places",
    copy: "Measure from the top inside edge of the opening down to the sill (the ledge the window sits on) on the left side, in the center, and on the right side. Write down all three.",
  },
  {
    title: "Measure the depth",
    copy: "Measure from the front edge of the opening straight back to the window frame or to the first thing that sticks out — a crank handle, lock, or alarm sensor. Note what the tape stopped at.",
  },
  {
    title: "Don't subtract anything",
    copy: "Write down the actual opening size exactly as measured. Any sizing adjustments a product needs are handled by BT Home Designs, not by you.",
  },
];

const outsideMountSteps = [
  {
    title: "Find the outside edges of the trim",
    copy: "The trim (also called molding or casing) is the decorative frame around the window. If your window has no trim, measure the opening edge to edge and note \"no trim.\"",
  },
  {
    title: "Measure the width",
    copy: "Measure from the outside edge of the trim on the left to the outside edge of the trim on the right.",
  },
  {
    title: "Measure the height",
    copy: "Measure from the top edge of the top trim down to the bottom edge of the lowest trim piece below the window.",
  },
  {
    title: "Don't add extra",
    copy: "Record just the window and trim. BT Home Designs decides how far past the window the treatment should extend and exactly where it mounts.",
  },
  {
    title: "Photograph the whole wall",
    copy: "Include the ceiling, nearby corners, and anything close to the window like light switches, vents, door frames, or furniture.",
  },
];

const faqs = [
  {
    q: "What's the difference between an inside mount and an outside mount?",
    a: "An inside mount fits within the window opening, so your trim stays visible and the look is clean and built-in. An outside mount attaches to the wall or trim and covers the window, trim and all — often used when an opening is shallow, obstructed, or when you want the window to look larger. If you're not sure which you want, measure for both and tell us; we'll help you decide.",
  },
  {
    q: "What if my window is uneven?",
    a: "That's common — houses settle, and many openings are a little wider or taller in one spot than another. Take all three width and height readings, write every one down, and don't average them or pick one. If the numbers are noticeably different or the window looks crooked, add a note and a photo. We may recommend a professional measure.",
  },
  {
    q: "Should I round my measurements?",
    a: "No. Write down exactly where the tape lands, including the fraction, like 35 ⅜. Don't round up or down and don't subtract anything. Any rounding or adjustments are handled by BT Home Designs based on the product and manufacturer you choose.",
  },
  {
    q: "Are my measurements final?",
    a: "No. Your measurements help us prepare a preliminary estimate. Before any order is placed, BT Home Designs confirms final measurements and product specifications at your windows, so you're never responsible for a sizing mistake on a custom order.",
  },
  {
    q: "Which products should I leave to a professional measure?",
    a: "Plantation shutters, motorized shades, exterior shades, and any unusual opening — arches, angles, bay windows, corner windows, or very large glass — should be measured by our team. Those depend on clearances and details that are hard to judge from a tape reading alone.",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to measure windows for custom window treatments",
  description:
    "Take preliminary inside-mount or outside-mount window measurements for a custom window treatment estimate. BT Home Designs confirms final measurements before ordering.",
  tool: [{ "@type": "HowToTool", name: "Steel tape measure" }],
  step: [
    {
      "@type": "HowToStep",
      name: "Get ready",
      text: "Use a steel tape measure, record measurements in inches as width × height, label each window by room, and take a straight-on photo.",
      url: `${business.urls.website}${PAGE_PATH}#before-you-start`,
    },
    {
      "@type": "HowToSection",
      name: "Inside mount",
      itemListElement: insideMountSteps.map((s) => ({
        "@type": "HowToStep",
        name: s.title,
        text: s.copy,
        url: `${business.urls.website}${PAGE_PATH}#inside-mount`,
      })),
    },
    {
      "@type": "HowToSection",
      name: "Outside mount",
      itemListElement: outsideMountSteps.map((s) => ({
        "@type": "HowToStep",
        name: s.title,
        text: s.copy,
        url: `${business.urls.website}${PAGE_PATH}#outside-mount`,
      })),
    },
  ],
};

export default function HowToMeasurePage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      {/* Intro */}
      <section className="pb-14 pt-32 md:pt-36">
        <div className="container-lux max-w-4xl!">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How to Measure" }]} />
          <p className="eyebrow mb-4 mt-8">Measuring Guide</p>
          <h1 className="text-4xl leading-[1.1] text-charcoal md:text-5xl">{TITLE}</h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-charcoal-soft">
            A few quick measurements and photos help us put together a more useful estimate before we ever visit. This
            guide walks you through it window by window — no special skills needed, just a tape measure and a few
            minutes per window.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/quote" size="lg" className="w-full sm:w-auto">
              Request a Quote
            </Button>
            <Button href="#worksheet" size="lg" variant="secondary" icon={false} className="w-full sm:w-auto">
              Open the Worksheet
            </Button>
          </div>

          <Note className="mt-10">
            <strong className="font-semibold text-charcoal">These are preliminary measurements.</strong> They&apos;re for
            your initial estimate only. BT Home Designs confirms final measurements and product specifications at your
            windows before any order is placed.
          </Note>

          <nav aria-label="On this page" className="mt-10">
            <p className="eyebrow mb-3">On this page</p>
            <ul className="flex flex-wrap gap-2">
              {onThisPage.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-block rounded-full border border-charcoal/15 px-4 py-2 text-[13px] text-charcoal-soft transition-colors hover:border-oak-dark hover:text-oak-dark"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Before you start */}
      <section id="before-you-start" className="scroll-mt-28 bg-cream py-20 lg:py-24">
        <div className="container-lux max-w-4xl!">
          <SectionHeading
            eyebrow="Step 1"
            title="Before you start measuring"
            copy="Five habits that make your measurements easy for us to read and use."
          />
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {beforeYouStart.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="rounded-sm border border-charcoal/10 bg-warm-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-oak/15">
                    <Icon className="h-4 w-4 text-oak-dark" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg text-charcoal">{title}</h3>
                </div>
                <p className="mt-2.5 text-[14px] leading-relaxed text-charcoal-soft">{copy}</p>
              </li>
            ))}
          </ul>
          <Diagram
            className="mt-10"
            src={img("width-x-height")}
            width={560}
            height={420}
            alt="Diagram of a window showing width measured side to side as measurement 1 and height measured top to bottom as measurement 2, written as width times height, for example 36 3/8 × 60 1/2."
            caption="Width is always first: write 36 ⅜ × 60 ½, not 60 ½ × 36 ⅜."
          />
        </div>
      </section>

      {/* Inside vs outside mount */}
      <section id="mount-types" className="scroll-mt-28 py-20 lg:py-24">
        <div className="container-lux max-w-4xl!">
          <SectionHeading
            eyebrow="Step 2"
            title="Inside mount vs. outside mount"
            copy={"“Mount” just means where the treatment attaches. Choose one for each window, or measure for both if you’re not sure — we’ll help you decide."}
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-sm border border-charcoal/10 bg-cream p-6">
              <p className="font-display text-xl text-charcoal">Inside mount</p>
              <p className="mt-2 text-[14px] leading-relaxed text-charcoal-soft">
                The treatment fits <em>inside</em> the window opening — the recessed box the window sits in — so the trim
                around the window stays visible.
              </p>
            </div>
            <div className="rounded-sm border border-charcoal/10 bg-cream p-6">
              <p className="font-display text-xl text-charcoal">Outside mount</p>
              <p className="mt-2 text-[14px] leading-relaxed text-charcoal-soft">
                The treatment attaches to the wall or trim <em>outside</em> the opening and covers the window, trim and
                all.
              </p>
            </div>
          </div>

          <div id="inside-mount" className="mt-16 scroll-mt-28">
            <h3 className="text-2xl text-charcoal md:text-3xl">How to measure for an inside mount</h3>
            <Steps steps={insideMountSteps} />
            <Diagram
              className="mt-10"
              src={img("inside-mount")}
              width={560}
              height={560}
              alt="Front view of a recessed window. Width A is measured between the inside side walls of the opening and height B from the top of the opening to the sill, without including the trim. A view from above shows depth C, measured from the front edge of the opening back to the window glass."
              legend={[
                ["A", "Width of the opening, inside wall to inside wall"],
                ["B", "Height of the opening, top to sill"],
                ["C", "Depth, from the front edge of the opening back to the window or first obstruction"],
              ]}
            />
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <Diagram
                src={img("width-three-readings")}
                width={560}
                height={420}
                alt="Window opening with three width measurements between the inside side walls: 1 near the top, 2 in the middle, and 3 near the bottom."
                caption="Three widths: top, middle, and bottom."
              />
              <Diagram
                src={img("height-three-readings")}
                width={560}
                height={440}
                alt="Window opening with three height measurements from the top of the opening to the sill: 1 on the left, 2 in the center, and 3 on the right."
                caption="Three heights: left, center, and right."
              />
            </div>
          </div>

          <div id="outside-mount" className="mt-16 scroll-mt-28">
            <h3 className="text-2xl text-charcoal md:text-3xl">How to measure for an outside mount</h3>
            <Steps steps={outsideMountSteps} />
            <Diagram
              className="mt-10"
              src={img("outside-mount")}
              width={560}
              height={440}
              alt="Front view of a window with trim. Width A is measured from the outside edge of the trim on the left to the outside edge on the right. Height B is measured from the top edge of the top trim to the bottom edge of the bottom trim."
              legend={[
                ["A", "Width, outside edge to outside edge of the trim"],
                ["B", "Height, top of the top trim to bottom of the lowest trim"],
              ]}
            />
          </div>

          <div id="out-of-square" className="mt-16 scroll-mt-28">
            <h3 className="text-2xl text-charcoal md:text-3xl">If your window is out of square</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
              &quot;Out of square&quot; means the opening isn&apos;t a perfect rectangle — it&apos;s a little wider at
              the top than the bottom, for example. It&apos;s common, especially as a house settles.
            </p>
            <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-charcoal-soft">
              <Bullet>Write down every reading exactly as measured. Don&apos;t average them or choose just one.</Bullet>
              <Bullet>Add a note saying which spot measured smaller or larger (for example, &quot;bottom is narrower&quot;).</Bullet>
              <Bullet>
                If the numbers are noticeably different or the window looks crooked, include a photo and{" "}
                <Link href="/quote" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                  request a professional measure
                </Link>{" "}
                — we&apos;ll check the opening in person.
              </Bullet>
            </ul>
          </div>
        </div>
      </section>

      {/* Drapery */}
      <section id="drapery" className="scroll-mt-28 bg-cream py-20 lg:py-24">
        <div className="container-lux max-w-4xl!">
          <SectionHeading
            eyebrow="Step 3 · By Product"
            title="How to measure for drapery or curtains"
            copy="Here's how to measure windows for custom drapes. Which measurements you need depends on whether a rod or track is already on the wall."
          />
          <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
            You don&apos;t need to decide rod placement, drapery length, or how far panels should extend past the window
            — we&apos;ll work that out with you. See our{" "}
            <Link href="/services/custom-drapery" className="font-medium text-oak-dark underline-offset-2 hover:underline">
              custom drapery
            </Link>{" "}
            page for styles, fabrics, and lining options.
          </p>

          <div className="mt-12">
            <h3 className="text-2xl text-charcoal md:text-3xl">If no rod or track is installed yet</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
              Record these four measurements for each window or door, plus a straight-on photo:
            </p>
            <Diagram
              className="mt-8"
              src={img("drapery-no-rod")}
              width={560}
              height={540}
              alt="Window between the ceiling and floor with four drapery measurements: A, window width including the outer trim; B, window height including the outer trim; C, ceiling to floor; and D, bottom of the trim to the floor."
              legend={[
                ["A", "Width of the window or door, including the outer molding (trim)"],
                ["B", "Height of the window or door, including the outer molding"],
                ["C", "Ceiling to floor, measured on the wall near the window"],
                ["D", "Bottom of the molding to the floor — for a door that reaches the floor, this can be 0"],
              ]}
            />
          </div>

          <div className="mt-14">
            <h3 className="text-2xl text-charcoal md:text-3xl">If a rod or track is already installed</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
              Record these two measurements and send a photo of the hardware — close enough to see the brackets and
              rings — along with a photo of the whole window. Let us know whether you plan to keep that rod or track.
            </p>
            <Diagram
              className="mt-8"
              src={img("drapery-existing-rod")}
              width={560}
              height={520}
              alt="Drapery rod mounted above a window with a decorative finial on each end. A is the rod width from end to end, not including the finials. B is the distance from the top of the rod to the floor."
              legend={[
                ["A", "Rod or track width, end to end — don't include the decorative end pieces (finials)"],
                ["B", "Top of the rod or track down to the floor"],
              ]}
            />
          </div>
        </div>
      </section>

      {/* Roman shades */}
      <section id="roman-shades" className="scroll-mt-28 py-20 lg:py-24">
        <div className="container-lux max-w-4xl!">
          <SectionHeading
            eyebrow="By Product"
            title="How to measure for Roman shades"
            copy="Roman shades can be mounted inside or outside the window. Follow the steps for the mount you want."
          />
          <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
            Browse fabrics and fold styles on our{" "}
            <Link href="/services/roman-shades" className="font-medium text-oak-dark underline-offset-2 hover:underline">
              Roman shades
            </Link>{" "}
            page.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-2xl text-charcoal">Inside mount</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-charcoal-soft">
                Measure the exact width and height of the opening itself, using the{" "}
                <a href="#inside-mount" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                  inside mount steps
                </a>{" "}
                above — three widths, three heights, and the depth. Don&apos;t subtract anything.
              </p>
              <Diagram
                className="mt-6"
                src={img("roman-inside-mount")}
                width={560}
                height={400}
                alt="Roman shade raised inside a window opening. Width A is measured between the inside side walls of the opening and height B from the top of the opening to the sill."
                legend={[
                  ["A", "Exact opening width"],
                  ["B", "Exact opening height"],
                ]}
              />
            </div>
            <div>
              <h3 className="text-2xl text-charcoal">Outside mount</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-charcoal-soft">
                Measure the window including its trim, using the{" "}
                <a href="#outside-mount" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                  outside mount steps
                </a>
                , and send a photo. BT Home Designs will determine the final coverage and mounting placement.
              </p>
              <Diagram
                className="mt-6"
                src={img("outside-mount")}
                width={560}
                height={440}
                alt="Window with trim for a Roman shade outside mount. Width A is measured across the outside edges of the trim and height B from the top of the top trim to the bottom of the bottom trim."
                legend={[
                  ["A", "Width including trim"],
                  ["B", "Height including trim"],
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Valances */}
      <section id="valances" className="scroll-mt-28 bg-cream py-20 lg:py-24">
        <div className="container-lux max-w-4xl!">
          <SectionHeading
            eyebrow="By Product"
            title="How to measure for a valance"
            copy="A valance is a short fabric treatment across the top of a window, used on its own or over another treatment."
          />
          <div className="mt-10 grid grid-cols-1 items-start gap-8 md:grid-cols-2">
            <div className="text-[15px] leading-relaxed text-charcoal-soft">
              <p>For an estimate, all we need is:</p>
              <ul className="mt-3 space-y-2">
                <Bullet>The finished width you&apos;d like (A)</Bullet>
                <Bullet>The finished height you&apos;d like (B)</Bullet>
                <Bullet>A straight-on photo of the window</Bullet>
              </ul>
              <p className="mt-4">
                A rough idea is fine — hold the tape up where you picture the valance and note what looks right. We&apos;ll
                confirm proportions and placement with you.
              </p>
            </div>
            <Diagram
              src={img("valance")}
              width={560}
              height={440}
              alt="Valance across the top of a window. A is the finished width you would like and B is the finished height you would like."
              legend={[
                ["A", "Desired finished width"],
                ["B", "Desired finished height"],
              ]}
            />
          </div>
        </div>
      </section>

      {/* Other products */}
      <section id="other-products" className="scroll-mt-28 py-20 lg:py-24">
        <div className="container-lux max-w-4xl!">
          <SectionHeading eyebrow="By Product" title="Shades, blinds, shutters, and exterior shades" />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-sm border border-charcoal/10 bg-cream p-6">
              <h3 className="font-display text-xl text-charcoal">Roller shades, zebra shades, woven woods, and blinds</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-charcoal-soft">
                For a rough estimate, use the general{" "}
                <a href="#inside-mount" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                  inside mount
                </a>{" "}
                or{" "}
                <a href="#outside-mount" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                  outside mount
                </a>{" "}
                steps and include a photo. Sizing rules for these products differ by manufacturer, so we confirm every
                detail at a professional measure before ordering.
              </p>
            </div>
            <div className="rounded-sm border border-oak/40 bg-warm-white p-6">
              <h3 className="font-display text-xl text-charcoal">Request a professional measure for these</h3>
              <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-charcoal-soft">
                <Bullet>
                  <Link href="/services/plantation-shutters" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                    Plantation shutters
                  </Link>
                </Bullet>
                <Bullet>
                  <Link href="/services/motorized-shades" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                    Motorized shades
                  </Link>{" "}
                  or any motorized product
                </Bullet>
                <Bullet>
                  <Link href="/services/exterior-shades" className="font-medium text-oak-dark underline-offset-2 hover:underline">
                    Exterior shades
                  </Link>
                </Bullet>
                <Bullet>Arches, angles, bay or corner windows, and very large glass</Bullet>
              </ul>
              <p className="mt-3 text-[14px] leading-relaxed text-charcoal-soft">
                These depend on clearances, frame details, and power or mounting locations that are hard to judge with a
                tape measure. A photo and a rough width × height are plenty for now — please don&apos;t guess at
                clearances or deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Worksheet */}
      <section id="worksheet" className="scroll-mt-28 bg-cream py-20 lg:py-24">
        <div className="container-lux max-w-5xl!">
          <SectionHeading
            eyebrow="Step 4"
            title="Your measurement worksheet"
            copy="Fill it in on your phone as you go, or print it and write in the blanks. Use one entry per window."
          />
          <div className="mt-10">
            <MeasurementWorksheet />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-28 py-20 lg:py-24">
        <div className="container-lux max-w-3xl!">
          <SectionHeading eyebrow="Common Questions" title="Measuring FAQ" />
          <div className="mt-10">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-matte-black py-20 text-center lg:py-24">
        <div className="container-lux max-w-3xl!">
          <h2 className="text-3xl text-warm-white md:text-4xl">Send us your measurements for an estimate</h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-warm-white/75">
            Start a quote request and tell us what you&apos;re considering. A short summary in the &quot;Approximate
            Sizes&quot; field is plenty — when we follow up, we&apos;ll collect your full worksheet and photos and prepare
            your preliminary quote.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/quote" size="lg" variant="accent" className="w-full sm:w-auto">
              Request a Quote
            </Button>
            <Button href="/contact" size="lg" variant="light" icon={false} className="w-full sm:w-auto">
              Ask a Question
            </Button>
          </div>
          <p className="mx-auto mt-10 max-w-xl text-[13px] leading-relaxed text-warm-white/55">
            BT Home Designs provides custom window treatments in Dallas–Fort Worth, including Rockwall, Heath, Royse City,
            Forney, Fate, Terrell, Dallas, and Frisco, TX.{" "}
            <Link href="/service-area" className="text-oak-light underline-offset-2 hover:underline">
              See our service area
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function Note({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-3 rounded-sm border-l-2 border-oak bg-cream p-5 ${className ?? ""}`}>
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-oak-dark" strokeWidth={1.75} aria-hidden="true" />
      <p className="text-[14px] leading-relaxed text-charcoal-soft">{children}</p>
    </div>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-oak" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function Steps({ steps }: { steps: { title: string; copy: string }[] }) {
  return (
    <ol className="mt-6 space-y-5">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-matte-black text-[13px] font-semibold text-warm-white">
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-charcoal">{s.title}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-charcoal-soft">{s.copy}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Diagram({
  src,
  width,
  height,
  alt,
  caption,
  legend,
  className,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  legend?: [string, string][];
  className?: string;
}) {
  return (
    <figure className={`mx-auto w-full max-w-[560px] ${className ?? ""}`}>
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full rounded-sm border border-charcoal/10" />
      {(caption || legend) && (
        <figcaption className="mt-3 text-[14px] leading-relaxed text-charcoal-soft">
          {caption && <p>{caption}</p>}
          {legend && (
            <dl className="space-y-1.5">
              {legend.map(([letter, text]) => (
                <div key={letter} className="flex gap-3">
                  <dt className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-oak-dark text-[12px] font-bold text-warm-white">
                    {letter}
                  </dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          )}
        </figcaption>
      )}
    </figure>
  );
}

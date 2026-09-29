import Image from "next/image";
import { FadeIn } from "./FadeIn";
import { SectionHeading } from "./SectionHeading";

/**
 * Editorial, image-driven storytelling for the Plantation Shutters page
 * only — conditionally rendered by app/services/[slug]/page.tsx. Every
 * image here was reviewed individually against the actual page copy
 * before use; none are stock, all are either the site owner's own
 * source photography or approved AI-generated renderings, and none
 * contain baked-in text — every label below is real HTML.
 *
 * All 19 inventory items are covered with real, individually reviewed
 * images — no fallback treatment currently in use on this page.
 */

function Caption({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="mt-4">
      <p className="font-display text-lg text-charcoal">{title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-soft">{copy}</p>
    </div>
  );
}

function Frame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`group relative aspect-[4/3] w-full overflow-hidden rounded-sm ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </div>
  );
}

export function PlantationShutterGallery() {
  return (
    <div className="bg-warm-white">
      {/* Materials */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Materials" title="Two ways to build a shutter that lasts" copy="Hardwood or weather-stable composite, depending on the room." />
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <FadeIn>
              <Frame src="/images/services/shutters/shutters-material-wood.jpg" alt="Close-up of hardwood plantation shutter louvers showing natural wood grain" />
              <Caption title="Hardwood" copy="Real wood grain and the lightest weight for its strength — suited to living areas and bedrooms." />
            </FadeIn>
            <FadeIn delay={0.08}>
              <Frame src="/images/services/shutters/shutters-material-composite.jpg" alt="White composite plantation shutters in a bright dining room" />
              <Caption title="Weather-Stable Composite" copy="Built to resist warping and humidity — a practical choice for sunrooms, kitchens, and bathrooms." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Louver Size */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Louver Size" title="Scale changes the whole feel of a room" copy="A range of common sizes — your designer will confirm current options." />
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <FadeIn>
              <Frame src="/images/services/shutters/shutters-louver-small.jpg" alt="Smaller-scale plantation shutter louvers, tighter spacing" />
              <Caption title="Smaller Louvers" copy="A more traditional scale with a tighter visual rhythm." />
            </FadeIn>
            <FadeIn delay={0.08}>
              <Frame src="/images/services/shutters/shutters-louver-large.jpg" alt="Larger-scale plantation shutter louvers, wider spacing and more open view" />
              <Caption title="Larger Louvers" copy="A broader architectural scale with more view when open." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Tilt Systems */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Tilt Systems" title="Operate the light, however visible you want the hardware" />
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <FadeIn>
              <Frame src="/images/services/shutters/shutters-tilt-front-rod.jpg" alt="Plantation shutter with a traditional visible front tilt rod" />
              <Caption title="Front Tilt Rod" copy="The classic look — a vertical rod on the face of the panel connects every louver." />
            </FadeIn>
            <FadeIn delay={0.08}>
              <Frame src="/images/services/shutters/shutters-tilt-hidden.jpg" alt="Plantation shutter with a hidden rear tilt system and no visible rod" />
              <Caption title="Hidden / Rear Tilt" copy="A clean, uninterrupted face — the mechanism is concealed inside the frame." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Light Control */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Light Control" title="Full tilt range" copy="Move from closed privacy to filtered daylight and a more open view." />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FadeIn>
              <Frame src="/images/services/shutters/shutters-light-closed.jpg" alt="Plantation shutter louvers fully closed for privacy" />
              <Caption title="Closed" copy="Full privacy, louvers sealed edge to edge." />
            </FadeIn>
            <FadeIn delay={0.06}>
              <Frame src="/images/services/shutters/shutters-light-partial.jpg" alt="Plantation shutter louvers partially open, filtering daylight" />
              <Caption title="Partially Open" copy="Softened, filtered daylight with the view broken up." />
            </FadeIn>
            <FadeIn delay={0.12}>
              <Frame src="/images/services/shutters/shutters-light-open.jpg" alt="Plantation shutter louvers fully open for maximum daylight and view" />
              <Caption title="Fully Open" copy="Maximum daylight and an unobstructed view outward." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Frames & Mounting */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Frames & Mounting" title="Built into the opening, or over it" />
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <FadeIn>
              <Frame src="/images/services/shutters/shutters-mount-inside.jpg" alt="Plantation shutter installed with an inside mount, flush within the window frame" />
              <Caption title="Inside Mount" copy="Sits flush within the window opening for a built-in, architectural look." />
            </FadeIn>
            <FadeIn delay={0.08}>
              <Frame src="/images/services/shutters/shutters-mount-outside.jpg" alt="Plantation shutter installed with an outside mount, frame over the wall trim" />
              <Caption title="Outside Mount" copy="The frame sits on the wall around the opening — useful for shallower windows." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <Frame src="/images/services/shutters/shutters-privacy-frame-detail.jpg" alt="Close-up detail of a plantation shutter frame showing a tight, gap-free fit" className="aspect-[4/3] lg:aspect-[4/5]" />
          </FadeIn>
          <FadeIn delay={0.08}>
            <p className="eyebrow mb-4">Privacy</p>
            <h2 className="text-3xl leading-[1.15] text-charcoal md:text-[2.75rem]">Complete privacy begins with a precise fit.</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-charcoal-soft">
              Because the louvers close edge-to-edge inside a solid, precisely measured frame, shutters
              typically offer more complete visual privacy when closed than a soft shade with fabric side
              gaps — hidden tilt hardware keeps the face uninterrupted.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Insulation */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Insulation" title="An additional physical layer between the room and the glass" align="center" className="mx-auto" />
          <FadeIn className="mt-12">
            <Frame src="/images/services/shutters/shutters-insulation-room.jpg" alt="Bright living room with closed plantation shutters and warm natural light" className="aspect-[16/9]" />
          </FadeIn>
        </div>
      </section>

      {/* Panel Operation */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Panel Operation" title="Designed around the opening" copy="Shutter configuration can be designed around larger or specialty openings." />
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <FadeIn>
              <Frame src="/images/services/shutters/shutters-operation-bifold.jpg" alt="Plantation shutter panels folded open in a bi-fold configuration" />
              <Caption title="Bi-Fold" copy="Panels fold against each other to stack neatly, leaving the opening clear." />
            </FadeIn>
            <FadeIn delay={0.08}>
              <Frame src="/images/services/shutters/shutters-operation-bypass.jpg" alt="Plantation shutter panels sliding past each other in a bypass configuration over a sliding glass door" />
              <Caption title="Bypass" copy="Panels slide side to side on parallel tracks, overlapping to clear a wide opening." />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Best For / Specialty Applications */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Best For" title="Designed around the opening you actually have" copy="Arched, angled, and bay windows; French doors; whole-home consistency." />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FadeIn>
              <Frame src="/images/services/shutters/shutters-bestfor-arched.jpg" alt="Plantation shutters fitted to an arched window with radial sunburst louvers" className="aspect-[4/5]" />
              <Caption title="Arched Windows" copy="Radial louvers are cut and hung to follow the curve, not cover it up." />
            </FadeIn>
            <FadeIn delay={0.06}>
              <Frame src="/images/services/shutters/shutters-bestfor-angled.jpg" alt="Plantation shutters fitted to an angled staircase window" className="aspect-[4/5]" />
              <Caption title="Angled Windows" copy="Louvers cut to follow the slope precisely, panel by panel." />
            </FadeIn>
            <FadeIn delay={0.12}>
              <Frame src="/images/services/shutters/shutters-bestfor-bay.jpg" alt="Plantation shutters fitted across a three-window bay with a built-in bench" className="aspect-[4/5]" />
              <Caption title="Bay Windows" copy="Each angle of the bay gets its own properly fitted panel." />
            </FadeIn>
            <FadeIn delay={0.18}>
              <Frame src="/images/services/shutters/shutters-bestfor-frenchdoors.jpg" alt="Plantation shutters fitted to French doors with brass hardware" className="aspect-[4/5]" />
              <Caption title="French Doors" copy="Configured to keep the doorway fully usable, hardware and all." />
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}

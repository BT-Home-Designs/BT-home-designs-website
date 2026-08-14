export type ServiceVisual = "louver" | "roller" | "weave" | "drape" | "mesh";

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  /** Very short (2-6 word) card copy used in compact grids like the homepage. */
  shortTagline: string;
  heroCopy: string;
  description: string;
  /** Which CSS/SVG decorative motif (components/WindowArt.tsx) represents this service. */
  visual: ServiceVisual;
  benefits: { title: string; copy: string }[];
  /** Structured spec cards shown on the service page instead of a photo gallery. */
  designOptions: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "plantation-shutters",
    name: "Plantation Shutters",
    shortName: "Shutters",
    tagline: "Architectural, timeless, built into the home",
    shortTagline: "Timeless beauty built to last.",
    heroCopy:
      "Solid hardwood and composite shutters, hand-fitted to every window in your Texas home — the closest thing to permanent architecture a window treatment can be.",
    description:
      "Plantation shutters are the most requested treatment in North Texas for a reason: they hold their shape through decades of heat, add real resale value, and control light with a single tilt of the louver. We build every panel to the exact opening — no fillers, no gaps — using hardwood or weather-stable composite depending on the room.",
    benefits: [
      { title: "Built for Texas heat", copy: "Composite and hybrid frames resist warping through triple-digit summers and hold their finish for decades." },
      { title: "Exact-fit engineering", copy: "Every panel is measured and hung to your opening — true divided louvers, hidden tilt rods, flush reveals." },
      { title: "Real resale value", copy: "Unlike soft treatments, shutters are considered a permanent architectural feature and are frequently cited in DFW listings." },
      { title: "Full light control", copy: "One tilt closes a room to full privacy; a second tilt fills it with soft, diffused daylight." },
    ],
    faqs: [
      { q: "Wood or composite — which is right for my home?", a: "We recommend hardwood for living areas and bedrooms for the richest grain and lightest weight, and composite for kitchens, bathrooms, and sunrooms where humidity and direct sun are constant." },
      { q: "How long does installation take?", a: "Most homes are measured in one visit and installed in a single day, several weeks after your order is placed — your designer will confirm a specific timeline." },
      { q: "Can shutters be fitted to bay or arched windows?", a: "Yes. Arches, angles, bays, and French doors are all part of our standard measuring process — we template unusual openings by hand." },
      { q: "Do shutters help with energy bills?", a: "Closed hardwood or composite louvers add a meaningful insulating layer against both summer heat gain and winter draft, which DFW homeowners notice most in west-facing rooms." },
    ],
    visual: "louver",
    designOptions: [
      { label: "Materials", value: "Hardwood or weather-stable composite, depending on the room" },
      { label: "Louver Size", value: "A range of common sizes — your designer will confirm current options" },
      { label: "Light Control", value: "Full tilt range, from closed privacy to soft diffused daylight" },
      { label: "Privacy", value: "Complete — no gaps at the frame, hidden tilt rods" },
      { label: "Insulation", value: "Adds a real thermal layer against summer heat and winter draft" },
      { label: "Best For", value: "Arched, angled, and bay windows; French doors; whole-home consistency" },
    ],
  },
  {
    slug: "roller-shades",
    name: "Roller Shades",
    shortName: "Roller Shades",
    tagline: "Clean lines, quiet operation, endless fabric options",
    shortTagline: "Sleek, modern & versatile.",
    heroCopy:
      "A single flat plane of fabric that rolls away out of sight — roller shades bring a tailored, minimal look to any room without competing with your architecture.",
    description:
      "Roller shades are the quiet workhorse of a well-designed home: nearly invisible when raised, precise when lowered, and available in hundreds of weaves from sheer to full blackout. We fabricate every shade to order in cassette, fabric-wrapped, or exposed-roll styles, with cordless, motorized, or continuous-loop operation.",
    benefits: [
      { title: "Hundreds of fabrics", copy: "From barely-there sheers to full room-darkening weaves, banded dual shades, and solar screens rated for DFW sun." },
      { title: "Disappears when raised", copy: "A slim cassette or fabric-wrapped headrail keeps the stack tight and nearly invisible against the ceiling line." },
      { title: "Child-safe by default", copy: "Every roller shade we install is cordless or motorized, meeting current safety standards for homes with kids and pets." },
      { title: "Whole-home consistency", copy: "The same clean profile scales from a single kitchen window to a wall of sliding glass doors." },
    ],
    faqs: [
      { q: "What's the difference between solar and blackout fabric?", a: "Solar screens filter UV and glare while preserving your view outward — ideal for west-facing DFW rooms. Blackout fabric fully blocks light for bedrooms and media rooms." },
      { q: "Can I mix light-filtering and blackout in the same window?", a: "Yes — our dual roller system pairs a sheer or solar fabric with a blackout fabric on one headrail, controlled independently or together." },
      { q: "Are roller shades motorized?", a: "We offer manual, cordless spring-assist, and fully motorized options with app or voice control on the same fabric lineup." },
      { q: "How wide can a single roller shade span?", a: "Many single roller shades can cover very wide openings as one continuous shade — your measure technician will confirm what's achievable for your window, with reinforced tubes available for larger glass walls, depending on the manufacturer." },
    ],
    visual: "roller",
    designOptions: [
      { label: "Materials", value: "Hundreds of weaves, from sheer to full blackout" },
      { label: "Light Control", value: "Light-filtering, solar, or full blackout fabric" },
      { label: "Privacy", value: "Adjustable by fabric opacity; dual-shade option for both" },
      { label: "Motorization", value: "Manual, cordless spring-assist, or fully motorized" },
      { label: "Style", value: "Cassette, fabric-wrapped, or exposed-roll headrail" },
      { label: "Best For", value: "Kitchens, living rooms, and large glass walls up to ~12ft wide" },
    ],
  },
  {
    slug: "motorized-shades",
    name: "Motorized Shades",
    shortName: "Motorized",
    tagline: "Whole-home light control, one tap or one voice command",
    shortTagline: "Effortless comfort at your fingertips.",
    heroCopy:
      "Raise every shade in the house at sunrise, close the west wall automatically at 4pm, or set them from bed with your phone — motorization built into the home, not bolted on.",
    description:
      "Motorized shades pair any of our fabric, cellular, or woven wood systems with a quiet in-tube motor, controlled by remote, wall keypad, app, or your existing smart home system. We design the low-voltage wiring and hub placement during the same in-home consultation as your fabric selection, so the finished install looks and feels custom-built.",
    benefits: [
      { title: "Works with your smart home", copy: "Integrates with many popular smart-home systems for scheduled or voice-triggered scenes, depending on the motor and hub you choose." },
      { title: "Rechargeable or hardwired", copy: "Battery, solar-charged, and hardwired motor options fit new construction and retrofit projects alike." },
      { title: "Whisper-quiet motors", copy: "In-tube motors run near-silently, so scheduled movements don't interrupt a nursery, home office, or bedroom." },
      { title: "Scenes, not single shades", copy: "Group shades by room or exposure — one tap lowers every west-facing shade in the house at once." },
    ],
    faqs: [
      { q: "Do I need an electrician for motorized shades?", a: "Most installs run on rechargeable lithium battery packs and need no new wiring; hardwired or solar-charged options are available and we coordinate any electrical work." },
      { q: "Which smart home systems are compatible?", a: "Compatibility depends on the specific motor and hub you choose — your designer will confirm what integrates with your existing or planned smart-home system." },
      { q: "How long does the battery last?", a: "Battery life varies by usage, shade size, and motor — your designer can give you a more specific estimate based on the system you choose." },
      { q: "Can existing shades be retrofitted with motors?", a: "In many cases yes — we evaluate your current hardware during the consultation and recommend retrofit versus replacement." },
    ],
    visual: "roller",
    designOptions: [
      { label: "Materials", value: "Any fabric, cellular, or woven wood system in our lineup" },
      { label: "Power", value: "Rechargeable battery, solar-charged, or hardwired" },
      { label: "Smart Home", value: "Depends on the motor and hub you choose" },
      { label: "Motorization", value: "Whisper-quiet in-tube motors, grouped by room or scene" },
      { label: "Style", value: "Same fabric and headrail options as our manual lines" },
      { label: "Best For", value: "Whole-home automation, hard-to-reach windows, nurseries" },
    ],
  },
  {
    slug: "zebra-shades",
    name: "Zebra Shades",
    shortName: "Zebra Shades",
    tagline: "Alternating sheer and solid bands, dialed to the degree",
    shortTagline: "Light control with modern style.",
    heroCopy:
      "Two layers of fabric on one track let you dial in exactly how much of the outside world you want to see — from soft diffused daylight to full privacy.",
    description:
      "Zebra shades (also called banded or dual shades) alternate sheer and opaque fabric stripes on a single roll. Slide the shade and the stripes align or offset, letting you tune light and privacy continuously rather than choosing between open and closed. They read as modern and architectural, and work especially well in transitional and contemporary DFW homes.",
    benefits: [
      { title: "Continuous light control", copy: "Align the bands for a soft glow or offset them for full privacy — an in-between option roller shades can't match." },
      { title: "Modern, architectural look", copy: "Clean horizontal banding suits contemporary and transitional interiors without feeling heavy." },
      { title: "UV and glare filtering", copy: "Sheer sections cut harsh Texas glare while keeping sightlines to the yard or pool." },
      { title: "Cordless and motorized options", copy: "Same safety and smart-home compatibility as our roller shade line." },
    ],
    faqs: [
      { q: "How is a zebra shade different from a roller shade?", a: "A roller shade is one fabric layer that's either up or down. A zebra shade has two layers of alternating stripes you slide to adjust light continuously without raising or lowering the shade." },
      { q: "Do zebra shades work well in bright, west-facing rooms?", a: "Yes — they're one of our most popular choices for DFW's intense afternoon sun because you can fine-tune glare without losing the view entirely." },
      { q: "What fabric weights are available?", a: "Light-filtering, semi-privacy, and blackout-backed bands are all available in the same hardware system." },
      { q: "Can zebra shades be motorized?", a: "Yes, using the same in-tube motors as our roller and cellular lines." },
    ],
    visual: "roller",
    designOptions: [
      { label: "Materials", value: "Alternating sheer and opaque banded fabric" },
      { label: "Light Control", value: "Continuous — slide to align or offset the bands" },
      { label: "Privacy", value: "Full privacy when bands are offset" },
      { label: "Motorization", value: "Cordless or fully motorized, same as our roller line" },
      { label: "Style", value: "Clean horizontal banding, modern and architectural" },
      { label: "Best For", value: "West-facing rooms, contemporary and transitional interiors" },
    ],
  },
  {
    slug: "roman-shades",
    name: "Roman Shades",
    shortName: "Roman Shades",
    tagline: "Soft, tailored fabric folds that dress a window like furniture",
    shortTagline: "Tailored softness. Timeless fold.",
    heroCopy:
      "A single panel of fabric that rises into soft, structured folds — Roman shades bring the warmth of drapery and the clean function of a shade to one treatment.",
    description:
      "Roman shades are fabric window coverings that stack into neat horizontal folds as they're raised, rather than rolling or gathering. Available in flat, relaxed, and structured fold styles, they read as more tailored and residential than a roller shade while staying simpler than full drapery — a favorite for bedrooms, dining rooms, and any room that wants softness without heavy fabric.",
    benefits: [
      { title: "Soft, tailored look", copy: "Structured folds bring the warmth of fabric to a window without the fullness of floor-length drapery." },
      { title: "Fabric selection", copy: "Hundreds of designer fabrics, from light-filtering linen to full blackout weaves rated for DFW sun." },
      { title: "Cordless by default", copy: "Every Roman shade we install is cordless or motorized, meeting current safety standards for homes with kids and pets." },
      { title: "Liner options", copy: "Add a privacy or blackout liner behind the face fabric for bedrooms and media rooms without changing the look from outside." },
    ],
    faqs: [
      { q: "What's the difference between flat, relaxed, and structured folds?", a: "Flat Roman shades lie smooth when lowered for a tailored look; relaxed styles have a soft curve at the bottom; structured styles hold crisp, defined folds even when raised. Your designer can show samples of each in your room." },
      { q: "Can Roman shades provide blackout?", a: "Yes — a blackout liner can be added behind most face fabrics for bedrooms and media rooms, while keeping the same fabric visible from the room." },
      { q: "Are Roman shades safe for kids and pets?", a: "Every Roman shade we install is cordless or motorized as standard, which is generally considered safer than corded systems." },
      { q: "Can Roman shades be motorized?", a: "Yes, using the same in-tube motors as our roller and zebra shade lines." },
    ],
    visual: "drape",
    designOptions: [
      { label: "Materials", value: "Hundreds of designer fabrics, light-filtering to full blackout" },
      { label: "Fold Style", value: "Flat, relaxed, or structured" },
      { label: "Privacy", value: "Adjustable by fabric opacity; liner option for full privacy" },
      { label: "Motorization", value: "Cordless as standard, motorized available" },
      { label: "Style", value: "Tailored and soft — a middle ground between shades and drapery" },
      { label: "Best For", value: "Bedrooms, dining rooms, and rooms wanting softness without full drapery" },
    ],
  },
  {
    slug: "woven-woods",
    name: "Woven Woods",
    shortName: "Woven Woods",
    tagline: "Natural grasses and reeds, woven by hand",
    shortTagline: "Natural textures. Organic warmth.",
    heroCopy:
      "Bamboo, jute, and reed woven into a warm, textural shade that brings an organic material into rooms that call for something softer than a hard finish.",
    description:
      "Woven wood shades are handwoven from natural materials — bamboo, jute, rattan, and grasses — giving a room warmth and texture that fabric can't replicate. They're a favorite in sunrooms, breakfast nooks, and coastal or transitional interiors across North Texas, and are available flat, roman-fold, or with a blackout liner for bedrooms.",
    benefits: [
      { title: "Natural texture", copy: "Handwoven bamboo, jute, and grass materials add organic warmth no synthetic fabric fully replicates." },
      { title: "Liner options", copy: "Add a room-darkening or privacy liner behind the weave for bedrooms while keeping the woven face outward." },
      { title: "Roman or flat fold", copy: "Choose a soft cascading roman fold or a flat roll depending on the room's formality." },
      { title: "Sustainably sourced", copy: "Rapidly renewable bamboo and grasses sourced from responsibly managed groves." },
    ],
    faqs: [
      { q: "Are woven woods too casual for a formal living room?", a: "Not with the right weave — finer, tighter weaves and a tailored roman fold read as elevated and work well in formal spaces; looser weaves suit casual rooms." },
      { q: "Can I get privacy without losing the natural look?", a: "Yes — a fabric liner mounted behind the woven material adds privacy or room-darkening while the woven texture stays visible from inside and out." },
      { q: "Do woven woods hold up in humid rooms?", a: "We recommend them for living areas, bedrooms, and sunrooms; for full bathrooms we typically suggest composite shutters or a moisture-rated fabric shade instead." },
      { q: "What operating systems are available?", a: "Cordless lift, continuous loop, and motorized options are all available on our woven wood line." },
    ],
    visual: "weave",
    designOptions: [
      { label: "Materials", value: "Bamboo, jute, rattan, and natural grasses" },
      { label: "Light Control", value: "Natural filtering; add a liner for more control" },
      { label: "Privacy", value: "Sheer by nature — a fabric liner adds full privacy" },
      { label: "Fold Style", value: "Flat roll or soft cascading roman fold" },
      { label: "Style", value: "Organic texture for coastal and transitional rooms" },
      { label: "Best For", value: "Sunrooms, breakfast nooks, living rooms, bedrooms with a liner" },
    ],
  },
  {
    slug: "custom-drapery",
    name: "Custom Drapery",
    shortName: "Drapery",
    tagline: "Floor-to-ceiling softness, made to your exact windows",
    shortTagline: "Elegant fabrics. Tailored to you.",
    heroCopy:
      "Full-length drapery, hand-sewn to your fabric, lining, and hardware selections — the finishing layer that makes a room feel designed rather than decorated.",
    description:
      "Custom drapery is sewn to order from hundreds of designer fabrics, in your choice of pleat style, lining, and hardware, and hung to the exact height and width your windows call for. Pair it as a soft frame around shutters or shades, or run it alone for a bedroom or formal dining room that wants pure texture and drape.",
    benefits: [
      { title: "Made-to-measure", copy: "Every panel is cut and sewn to your window's exact height, with pooling, break, or hem specified during your consultation." },
      { title: "Designer fabric library", copy: "Hundreds of textiles from linen and velvet to performance weaves rated for DFW sun exposure." },
      { title: "Blackout and interlining", copy: "Add a blackout or interlining layer invisibly behind any fabric for bedrooms and media rooms." },
      { title: "Hardware included", copy: "Rods, rings, and finials selected and installed as part of the same project — no separate hardware store trip." },
    ],
    faqs: [
      { q: "What pleat styles are available?", a: "Pinch pleat, goblet, ripple fold, and tab top are our most-requested styles, each shown on fabric samples during your in-home consultation." },
      { q: "Can drapery be paired with my existing shutters or shades?", a: "Yes — drapery layered over shutters or roller shades is one of our most common requests, adding softness and framing without losing function." },
      { q: "Is motorized drapery available?", a: "Yes, on a quiet traverse track with app and voice control, most often specified for primary bedrooms and great rooms." },
      { q: "How long does custom drapery take to fabricate?", a: "Timelines vary by fabric and hardware lead times — your consultant will provide a specific estimate once your order details are finalized." },
    ],
    visual: "drape",
    designOptions: [
      { label: "Fabric", value: "Hundreds of designer textiles, linen to velvet" },
      { label: "Lining", value: "Standard, blackout, or interlining, sewn in invisibly" },
      { label: "Pleat Style", value: "Pinch pleat, goblet, ripple fold, or tab top" },
      { label: "Hardware", value: "Rods, rings, and finials selected and installed together" },
      { label: "Length", value: "Made-to-measure — floor, break, or intentional pooling" },
      { label: "Layering", value: "Pairs with shutters or shades for a fully framed window" },
    ],
  },
  {
    slug: "exterior-shades",
    name: "Exterior Shades",
    shortName: "Exterior",
    tagline: "Take the living room outside",
    shortTagline: "Comfort. Shade. Outdoor living.",
    heroCopy:
      "Motorized solar screens for patios, porches, and outdoor kitchens — built to handle Texas wind and sun while keeping the space usable ten months a year.",
    description:
      "Exterior shades extend your living space onto the patio, screening intense afternoon sun and wind-driven debris while keeping the view. Built from UV-stabilized solar mesh and weather-rated tracks, they're engineered specifically for North Texas's combination of high heat, strong storms, and bright western exposure — and motorize into a compact headbox when not in use.",
    benefits: [
      { title: "Built for DFW weather", copy: "Wind-rated tracks and UV-stabilized mesh hold up to summer storms and year-round sun exposure." },
      { title: "Extends outdoor living", copy: "Cuts patio surface temperature and glare enough to keep outdoor kitchens and seating areas usable through peak summer afternoons." },
      { title: "Motorized as standard", copy: "Remote or app-controlled operation retracts the full screen into a slim headbox in seconds." },
      { title: "Mesh density options", copy: "Choose openness from light-filtering to near-total privacy and sun block, depending on the exposure." },
    ],
    faqs: [
      { q: "Will exterior shades hold up in North Texas storms?", a: "Our tracks and mesh are wind-rated for the region, and motorized shades can be programmed to auto-retract when a connected wind sensor detects gusts." },
      { q: "Do exterior shades block the view?", a: "Solar mesh is available in several openness percentages — lower openness blocks more heat and glare, higher openness preserves more of the view. We help you choose based on sun exposure." },
      { q: "Can exterior shades be added to an existing patio cover?", a: "Yes — most patio and pergola structures can be retrofitted; we assess mounting points during your in-home consultation." },
      { q: "How much heat reduction can I expect?", a: "Depending on mesh density and orientation, homeowners typically see a noticeable drop in radiant heat and glare on west- and south-facing patios." },
    ],
    visual: "mesh",
    designOptions: [
      { label: "Materials", value: "UV-stabilized solar mesh, wind-rated tracks" },
      { label: "Light Control", value: "Mesh openness from light-filtering to near-total block" },
      { label: "Weather", value: "Engineered for North Texas heat, sun, and storms" },
      { label: "Motorization", value: "Motorized as standard, retracts into a slim headbox" },
      { label: "Style", value: "Low-profile headbox, minimal visual footprint" },
      { label: "Best For", value: "Patios, porches, and outdoor kitchens" },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

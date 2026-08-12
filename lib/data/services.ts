export type Service = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  heroCopy: string;
  description: string;
  image: string;
  benefits: { title: string; copy: string }[];
  faqs: { q: string; a: string }[];
  galleryTag: string;
};

export const services: Service[] = [
  {
    slug: "plantation-shutters",
    name: "Plantation Shutters",
    shortName: "Shutters",
    tagline: "Architectural, timeless, built into the home",
    heroCopy:
      "Solid hardwood and composite shutters, hand-fitted to every window in your Texas home — the closest thing to permanent architecture a window treatment can be.",
    description:
      "Plantation shutters are the most requested treatment in North Texas for a reason: they hold their shape through decades of heat, add real resale value, and control light with a single tilt of the louver. We build every panel to the exact opening — no fillers, no gaps — using kiln-dried basswood or weather-stable composite for sun rooms and bathrooms.",
    image: "/images/services/plantation-shutters.jpg",
    benefits: [
      { title: "Built for Texas heat", copy: "Composite and hybrid frames resist warping through triple-digit summers and hold their finish for decades." },
      { title: "Exact-fit engineering", copy: "Every panel is measured and hung to your opening — true divided louvers, hidden tilt rods, flush reveals." },
      { title: "Real resale value", copy: "Unlike soft treatments, shutters are considered a permanent architectural feature and are frequently cited in DFW listings." },
      { title: "Full light control", copy: "One tilt closes a room to full privacy; a second tilt fills it with soft, diffused daylight." },
    ],
    faqs: [
      { q: "Wood or composite — which is right for my home?", a: "We recommend hardwood for living areas and bedrooms for the richest grain and lightest weight, and composite for kitchens, bathrooms, and sunrooms where humidity and direct sun are constant." },
      { q: "How long does installation take?", a: "Most homes are measured in one visit and installed in a single day, four to six weeks after your order is placed with our millwork partners." },
      { q: "Can shutters be fitted to bay or arched windows?", a: "Yes. Arches, angles, bays, and French doors are all part of our standard measuring process — we template unusual openings by hand." },
      { q: "Do shutters help with energy bills?", a: "Closed hardwood or composite louvers add a meaningful insulating layer against both summer heat gain and winter draft, which DFW homeowners notice most in west-facing rooms." },
    ],
    galleryTag: "Living Room",
  },
  {
    slug: "roller-shades",
    name: "Roller Shades",
    shortName: "Roller Shades",
    tagline: "Clean lines, quiet operation, endless fabric options",
    heroCopy:
      "A single flat plane of fabric that rolls away out of sight — roller shades bring a tailored, minimal look to any room without competing with your architecture.",
    description:
      "Roller shades are the quiet workhorse of a well-designed home: nearly invisible when raised, precise when lowered, and available in hundreds of weaves from sheer to full blackout. We fabricate every shade to order in cassette, fabric-wrapped, or exposed-roll styles, with cordless, motorized, or continuous-loop operation.",
    image: "/images/services/roller-shades.jpg",
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
      { q: "How wide can a single roller shade span?", a: "Standard fabrication covers openings up to roughly 12 feet wide as one continuous shade, with reinforced tubes for larger glass walls." },
    ],
    galleryTag: "Kitchen",
  },
  {
    slug: "motorized-shades",
    name: "Motorized Shades",
    shortName: "Motorized",
    tagline: "Whole-home light control, one tap or one voice command",
    heroCopy:
      "Raise every shade in the house at sunrise, close the west wall automatically at 4pm, or set them from bed with your phone — motorization built into the home, not bolted on.",
    description:
      "Motorized shades pair any of our fabric, cellular, or woven wood systems with a quiet in-tube motor, controlled by remote, wall keypad, app, or your existing smart home system. We design the low-voltage wiring and hub placement during the same in-home consultation as your fabric selection, so the finished install looks and feels custom-built.",
    image: "/images/services/motorized-shades.jpg",
    benefits: [
      { title: "Works with your smart home", copy: "Integrates with Lutron, Control4, Apple Home, Amazon Alexa, and Google Home for scheduled or voice-triggered scenes." },
      { title: "Rechargeable or hardwired", copy: "Battery, solar-charged, and hardwired motor options fit new construction and retrofit projects alike." },
      { title: "Whisper-quiet motors", copy: "In-tube motors run near-silently, so scheduled movements don't interrupt a nursery, home office, or bedroom." },
      { title: "Scenes, not single shades", copy: "Group shades by room or exposure — one tap lowers every west-facing shade in the house at once." },
    ],
    faqs: [
      { q: "Do I need an electrician for motorized shades?", a: "Most installs run on rechargeable lithium battery packs and need no new wiring; hardwired or solar-charged options are available and we coordinate any electrical work." },
      { q: "Which smart home systems are compatible?", a: "Our motorized line integrates with Lutron Caséta, Control4, Apple HomeKit, Amazon Alexa, and Google Home out of the box." },
      { q: "How long does the battery last?", a: "Typical use averages 12–18 months per charge, with a simple USB-C recharge cycle and no need to remove the shade." },
      { q: "Can existing shades be retrofitted with motors?", a: "In many cases yes — we evaluate your current hardware during the consultation and recommend retrofit versus replacement." },
    ],
    galleryTag: "Office",
  },
  {
    slug: "zebra-shades",
    name: "Zebra Shades",
    shortName: "Zebra Shades",
    tagline: "Alternating sheer and solid bands, dialed to the degree",
    heroCopy:
      "Two layers of fabric on one track let you dial in exactly how much of the outside world you want to see — from soft diffused daylight to full privacy.",
    description:
      "Zebra shades (also called banded or dual shades) alternate sheer and opaque fabric stripes on a single roll. Slide the shade and the stripes align or offset, letting you tune light and privacy continuously rather than choosing between open and closed. They read as modern and architectural, and work especially well in transitional and contemporary DFW homes.",
    image: "/images/services/zebra-shades.jpg",
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
    galleryTag: "Bedroom",
  },
  {
    slug: "woven-woods",
    name: "Woven Woods",
    shortName: "Woven Woods",
    tagline: "Natural grasses and reeds, woven by hand",
    heroCopy:
      "Bamboo, jute, and reed woven into a warm, textural shade that brings an organic material into rooms that call for something softer than a hard finish.",
    description:
      "Woven wood shades are handwoven from natural materials — bamboo, jute, rattan, and grasses — giving a room warmth and texture that fabric can't replicate. They're a favorite in sunrooms, breakfast nooks, and coastal or transitional interiors across North Texas, and are available flat, roman-fold, or with a blackout liner for bedrooms.",
    image: "/images/services/woven-woods.jpg",
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
    galleryTag: "Living Room",
  },
  {
    slug: "custom-drapery",
    name: "Custom Drapery",
    shortName: "Drapery",
    tagline: "Floor-to-ceiling softness, made to your exact windows",
    heroCopy:
      "Full-length drapery, hand-sewn to your fabric, lining, and hardware selections — the finishing layer that makes a room feel designed rather than decorated.",
    description:
      "Custom drapery is sewn to order from hundreds of designer fabrics, in your choice of pleat style, lining, and hardware, and hung to the exact height and width your windows call for. Pair it as a soft frame around shutters or shades, or run it alone for a bedroom or formal dining room that wants pure texture and drape.",
    image: "/images/services/custom-drapery.jpg",
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
      { q: "How long does custom drapery take to fabricate?", a: "Typically five to seven weeks from final measure to installation, depending on fabric and hardware lead times." },
    ],
    galleryTag: "Bedroom",
  },
  {
    slug: "exterior-shades",
    name: "Exterior Shades",
    shortName: "Exterior",
    tagline: "Take the living room outside",
    heroCopy:
      "Motorized solar screens for patios, porches, and outdoor kitchens — built to handle Texas wind and sun while keeping the space usable ten months a year.",
    description:
      "Exterior shades extend your living space onto the patio, screening intense afternoon sun and wind-driven debris while keeping the view. Built from UV-stabilized solar mesh and weather-rated tracks, they're engineered specifically for North Texas's combination of high heat, strong storms, and bright western exposure — and motorize into a compact headbox when not in use.",
    image: "/images/services/exterior-shades.jpg",
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
    galleryTag: "Patio",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

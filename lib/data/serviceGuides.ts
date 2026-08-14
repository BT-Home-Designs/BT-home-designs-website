/**
 * Educational guide content for each service page — options, materials,
 * how-to-choose guidance, room suitability, care, and FAQs. Kept separate
 * from lib/data/services.ts (which holds the shorter card/hero copy used
 * on the homepage and services index) so the homepage doesn't have to
 * import this much larger dataset.
 *
 * CONTENT ACCURACY: this is general product education, not a catalog of
 * confirmed BT Home Designs offerings. Specific materials, sizes, brands,
 * timelines, and prices are deliberately not stated as fixed facts —
 * wording like "available options may include" and "your designer will
 * confirm current options" is used throughout on purpose. Do not add
 * invented brand names, warranties, lead times, or prices here.
 */

export type GuideOptionItem = { name: string; description: string };
export type GuideOptionGroup = { title: string; intro?: string; items: GuideOptionItem[] };
export type ComparisonTable = { columns: string[]; rows: string[][] };
export type RoomNote = { room: string; note: string };
export type GuideFaq = { q: string; a: string };

export type ServiceGuide = {
  intro: string[];
  lightControlPrivacy: string[];
  optionGroups: GuideOptionGroup[];
  materials: GuideOptionGroup;
  comparisonTable?: ComparisonTable;
  howToChoose: string[];
  roomSuitability: RoomNote[];
  care: string[];
  faqs: GuideFaq[];
};

/** Shared consultation-to-installation process, shown on every service page. */
export const consultationSteps = [
  { step: "01", title: "Design Conversation", copy: "We start with your goals — privacy, light control, style, and budget — in your home, in the actual light your windows get." },
  { step: "02", title: "Samples & Options", copy: "Your designer brings real material and fabric samples so you can see and feel the options against your own walls and floors, not a catalog page." },
  { step: "03", title: "Professional Measuring", copy: "Every opening is measured by hand — including out-of-square windows, arches, and specialty shapes — before anything is ordered." },
  { step: "04", title: "Confirm the Details", copy: "Configuration, material, finish, mount type, and operation are all confirmed with you before the order is placed." },
  { step: "05", title: "Custom Ordering", copy: "Your selections are placed as a custom order; your designer will confirm a specific timeline based on the manufacturer and product you've chosen." },
  { step: "06", title: "Professional Installation", copy: "Our installers hang and test every panel or shade, walk you through operation, and make sure everything is working before they leave." },
];

export const serviceGuides: Record<string, ServiceGuide> = {
  "plantation-shutters": {
    intro: [
      "Plantation shutters are solid, hinged or sliding panels made up of horizontal slats — called louvers — set into a frame that's fixed permanently to your window or door opening. Tilting the louvers lets you dial in exactly how much daylight, glare, and outside visibility comes into a room, from fully open to fully closed, without raising or lowering anything.",
      "Because shutters are built into the window opening itself rather than hung as a soft treatment, they're generally considered a permanent architectural feature of the home rather than a piece of decor — similar to trim or cabinetry. That's part of why they're often mentioned specifically in real estate listings.",
      "Well-built shutters are valued for their durability, cordless and child-safe operation, straightforward cleaning, a meaningful layer of insulation at the window, and a classic look that doesn't tend to go out of style the way some fabric trends do.",
    ],
    lightControlPrivacy: [
      "A single tilt of the louvers moves a room continuously between full privacy and full daylight — there's no in-between step to raise or lower. On configurations with a divider rail or split-tilt rod, the top and bottom sections of a panel can be angled independently, so you can open the top louvers for light while keeping the bottom closed for privacy at eye level, or the reverse.",
      "Because the louvers close edge-to-edge inside a solid frame, shutters typically offer more complete visual privacy when closed than a soft shade with fabric side gaps — though the exact fit depends on the frame and mount type chosen for your window.",
    ],
    optionGroups: [
      {
        title: "Styles & Configurations",
        intro: "Available options may include:",
        items: [
          { name: "Full-height shutters", description: "One continuous panel (or set of panels) covering the entire window height — the most common configuration for a clean, architectural look." },
          { name: "Café-style shutters", description: "Cover only the lower portion of a window, leaving the top open for light while blocking street-level sightlines — popular for street-facing rooms." },
          { name: "Tier-on-tier shutters", description: "Two independent panel sets stacked top and bottom, each operating separately for maximum flexibility on tall windows." },
          { name: "Bypass shutters", description: "Panels that slide side to side on a track, often used for very wide openings or closets where swing clearance isn't practical." },
          { name: "Bi-fold shutters", description: "Panels that fold against each other to stack neatly to one or both sides, useful where you want a fully unobstructed opening." },
          { name: "Single- and multi-panel configurations", description: "The number of panels per opening is chosen based on width, weight, and how you want the shutters to operate." },
          { name: "Divider rails", description: "A horizontal rail that splits a panel into independently tilting top and bottom sections." },
          { name: "Door and sliding-door applications", description: "Shutters can often be configured for French doors, sliding glass doors, and other door openings, typically with bi-fold or bypass operation to keep the doorway usable." },
          { name: "Specialty shapes", description: "Arched windows, circles, angled tops, and other unusual openings can often be templated and fitted, though the process and options vary by shape — your designer will confirm what's achievable for your specific window." },
        ],
      },
      {
        title: "Louver Sizes",
        intro: "Shutters are typically available in a few common louver widths, often in the general neighborhood of 2½\", 3½\", and 4½\" — exact sizes offered depend on the current manufacturer collection, so treat the ranges below as general guidance rather than a fixed spec sheet.",
        items: [
          { name: "Smaller louvers", description: "Tend to suit smaller windows and more traditional interiors, with a finer scale and more individual slats to operate." },
          { name: "Mid-size louvers", description: "A common middle-ground choice, balancing visibility, light flow, and a moderate number of slats per panel." },
          { name: "Larger louvers", description: "Show more of the view when open, let in more light per slat, and read as more contemporary — often favored on larger windows where scale matters." },
        ],
      },
      {
        title: "Tilt Systems",
        items: [
          { name: "Traditional front tilt rod", description: "A vertical rod on the face of the panel connects all louvers — classic look, simple and reliable operation." },
          { name: "Offset tilt rod", description: "Moves the tilt rod off-center so it doesn't align with your sightline through the window." },
          { name: "Hidden or rear tilt", description: "Operates the louvers from a mechanism concealed inside the frame, so no rod is visible on the face of the panel at all." },
          { name: "Split tilt", description: "Used with a divider rail to let the top and bottom sections of a panel tilt independently." },
        ],
      },
      {
        title: "Frames & Mounting",
        items: [
          { name: "Inside mount", description: "The frame sits inside the window opening for a built-in, flush look — requires adequate window depth and a reasonably square opening." },
          { name: "Outside mount", description: "The frame sits on the wall around the opening, which can help disguise an out-of-square window or add apparent size to a smaller one." },
          { name: "Decorative and minimal frame profiles", description: "Frame styles range from more traditional, detailed trim profiles to slim, minimal frames for a cleaner modern look." },
          { name: "Existing trim and clearance", description: "Your existing window trim, depth, and any obstructions — crank handles, locks, security sensors, screens — all factor into which mount and frame options will work for a given window." },
          { name: "Out-of-square openings", description: "Older or settled homes often have openings that aren't perfectly square; shutters can typically be scribed and fitted to accommodate this during measuring." },
        ],
      },
      {
        title: "Panel Operation",
        items: [
          { name: "Left- or right-hinged panels", description: "Determined by which direction makes sense for the room and how the panel will be used." },
          { name: "Multiple-panel openings", description: "Wider windows are typically split into two or more panels rather than one oversized panel, for both practicality and appearance." },
          { name: "Bi-fold and bypass operation", description: "Chosen when panels need to stack compactly or slide past each other rather than swing fully open." },
          { name: "Swing clearance", description: "Hinged panels need room to open — furniture placement, nearby doors, and traffic patterns are worth considering before finalizing configuration." },
        ],
      },
      {
        title: "Colors & Finishes",
        intro: "Available options may include:",
        items: [
          { name: "Whites and off-whites", description: "The most requested family of finishes, ranging from bright true white to warmer off-white tones." },
          { name: "Neutral painted finishes", description: "Soft greiges, taupes, and other neutrals to coordinate with a room's palette." },
          { name: "Wood stains", description: "For hardwood shutters, a range of stain tones can showcase natural grain rather than a painted finish." },
          { name: "Matching your trim", description: "Many homeowners choose a finish that coordinates with existing window and door trim for a seamless architectural look." },
        ],
      },
    ],
    materials: {
      title: "Material Options",
      intro: "Available options may include hardwood, engineered or composite wood, and poly or vinyl shutters, each with different strengths. Your designer will confirm which materials are currently available and right for your project.",
      items: [
        { name: "Hardwood", description: "Real wood grain and the lightest weight for its strength, generally suited to living areas and bedrooms away from constant moisture." },
        { name: "Engineered or composite wood", description: "Built to resist warping and humidity better than solid hardwood, often a practical choice for sunrooms and other high-exposure rooms." },
        { name: "Poly or vinyl", description: "A synthetic material built for maximum moisture resistance, typically the most durable option in consistently humid spaces." },
        { name: "Moisture-resistant options", description: "Beyond material choice, some product lines offer additional moisture-resistant treatments or hardware for bathrooms and similarly demanding rooms." },
      ],
    },
    comparisonTable: {
      columns: ["Option", "Best For", "Main Advantage", "Important Consideration"],
      rows: [
        ["Hardwood", "Living rooms, bedrooms, low-moisture rooms", "Natural grain, lighter weight", "Less suited to constant humidity"],
        ["Engineered / composite wood", "Sunrooms, moderate-humidity rooms", "Resists warping from heat and moisture", "Slightly heavier than hardwood"],
        ["Poly / vinyl", "Bathrooms, laundry rooms, high humidity", "Maximum moisture resistance", "Fewer stain/wood-grain options"],
        ["Moisture-resistant hardware", "Any room with elevated humidity", "Protects moving parts over time", "Availability depends on manufacturer"],
      ],
    },
    howToChoose: [
      "How much privacy do you actually need in this room, and at what times of day?",
      "Is preserving the outside view a priority, or is light control more important than visibility?",
      "Which direction does the window face, and how intense is the sun exposure?",
      "What are the window's exact dimensions and depth, including any obstructions?",
      "What's the interior style of the room — traditional, transitional, modern?",
      "Is the room exposed to regular moisture, like a bathroom or laundry room?",
      "Are there children or pets in the home who'll be around the shutters daily?",
      "How often will the shutters actually be operated — daily, or rarely?",
      "Do you prefer a low-maintenance finish, or are you comfortable with more upkeep for a specific look?",
      "What are your budget priorities relative to other rooms or projects in the home?",
      "How long do you plan to stay in the home — are you weighing long-term durability against upfront cost?",
    ],
    roomSuitability: [
      { room: "Living rooms", note: "A common choice for their durability and architectural presence in a high-traffic, high-visibility space." },
      { room: "Bedrooms", note: "Popular for privacy and light control; consider louver size and split-tilt if you want more control near a headboard wall." },
      { room: "Kitchens", note: "Generally well-suited if kept away from direct splash zones; easy to wipe down." },
      { room: "Bathrooms", note: "Moisture-resistant materials are typically recommended over hardwood in showers or steamy rooms." },
      { room: "Offices", note: "Good for reducing screen glare while keeping some natural light." },
      { room: "Nurseries", note: "Cordless operation is a common priority for child safety." },
      { room: "Media rooms", note: "Closed louvers cut glare well, though shutters alone typically won't achieve full blackout — ask about supplemental treatments if that's a priority." },
      { room: "Large windows", note: "Often split into multiple panels for practical operation and a balanced look." },
      { room: "Doors", note: "Bi-fold or bypass configurations are typically used so the doorway stays fully usable." },
    ],
    care: [
      "Dust regularly with a soft brush attachment or microfiber cloth to prevent buildup on louver edges.",
      "Wipe with a lightly damp cloth for deeper cleaning, avoiding excess moisture on hardwood finishes.",
      "Clean frames and sills the same way you'd clean painted trim.",
      "Keep hinges and tilt mechanisms free of dust so they continue operating smoothly.",
      "For any material-specific cleaning products or techniques, follow your manufacturer's care guidance — your designer can point you to it.",
    ],
    faqs: [
      { q: "Are plantation shutters energy-efficient?", a: "Closed shutters add a layer of insulation at the window that can help reduce heat gain in summer and drafts in winter, though the exact impact depends on your home, window, and the shutter material chosen." },
      { q: "Do shutters provide complete blackout?", a: "Standard shutters block most light when fully closed but typically aren't a true blackout solution on their own, since some light can pass at the frame edges. If full blackout is a priority, ask your designer about pairing shutters with a supplemental treatment." },
      { q: "Which material is best for bathrooms or humid rooms?", a: "Moisture-resistant materials such as poly or vinyl, or engineered composite options, are generally better suited to humid rooms than solid hardwood — your designer can confirm what's currently available." },
      { q: "What louver size should I choose?", a: "It depends on your window size, the view you want to preserve, and your interior style — smaller louvers suit traditional rooms and smaller windows, larger louvers suit contemporary spaces and bigger openings. Your designer can show you samples in your actual room." },
      { q: "Can shutters fit arched or unusually shaped windows?", a: "Many arched, angled, and otherwise unusually shaped windows can be templated and fitted, though the process and available configurations vary by shape and manufacturer." },
      { q: "Can shutters be installed on doors?", a: "Yes, in many cases — French doors and sliding doors are commonly fitted with bi-fold or bypass shutters that keep the doorway operable." },
      { q: "Do shutters work on very wide windows?", a: "Wide openings are typically divided into multiple panels for practical operation rather than built as one oversized panel." },
      { q: "Can the top and bottom louvers operate separately?", a: "Yes, with a divider rail and split-tilt configuration, the top and bottom sections of a panel can be angled independently." },
      { q: "How much window depth is required?", a: "Required depth depends on the mount type and frame profile chosen; your measure technician will confirm whether your window supports an inside mount or whether an outside mount makes more sense." },
      { q: "Can shutters be mounted outside the opening?", a: "Yes — an outside mount is a common option, and can help with openings that are out of square or too shallow for an inside mount." },
      { q: "Are shutters safe for children and pets?", a: "Shutters are a cordless, hinged or sliding hard-panel treatment, which is generally considered a safer option around young children and pets compared to treatments with pull cords." },
      { q: "How are shutters cleaned?", a: "Routine dusting and occasional wiping with a lightly damp cloth is typically all that's needed — see the care section above for more detail." },
      { q: "How long do custom shutters typically take?", a: "Timelines vary by manufacturer, material, and current order volume — your designer will provide a specific estimate once your order is placed." },
      { q: "What affects shutter pricing?", a: "Pricing depends on factors like measurements, material, configuration, finish, any specialty shapes, the manufacturer, and installation requirements — we don't publish fixed prices because of how much these vary project to project." },
      { q: "Do shutters add value to a home?", a: "Because they're considered a permanent architectural feature rather than a removable decor item, shutters are often viewed favorably in real estate listings, though actual resale impact varies by market and home." },
    ],
  },

  "roller-shades": {
    intro: [
      "Roller shades are a single flat plane of fabric that rolls up around a tube at the top of the window, disappearing almost entirely when raised. They're one of the most versatile window treatments available, with fabric options ranging from sheer to fully opaque, and they suit almost any room style from minimal and modern to warm and traditional.",
      "Because the fabric rolls into a tight, clean line rather than stacking in folds, roller shades read as tailored and architectural without competing with the rest of a room's design.",
    ],
    lightControlPrivacy: [
      "Light control is determined mainly by fabric choice. Sheer and light-filtering fabrics soften harsh sun while keeping a room bright; solar fabrics cut glare and UV while preserving much of the outside view; room-darkening and blackout fabrics block most or nearly all light.",
      "A fabric's openness factor — how much woven gap lets light and view through — is one of the main things your designer will help you weigh: a lower openness factor generally means more privacy and less visible light-filtering, while a higher openness factor keeps more of the view but offers less privacy after dark with lights on inside.",
    ],
    optionGroups: [
      {
        title: "Fabric Types",
        items: [
          { name: "Light-filtering", description: "Softens and diffuses daylight while keeping the room bright." },
          { name: "Solar", description: "Screens UV and glare while generally preserving visibility to the outside, described by an openness factor." },
          { name: "Room-darkening", description: "Blocks most light for bedrooms, media rooms, and similar spaces." },
          { name: "Blackout", description: "Blocks close to all light when fully lowered — often paired with side channels to minimize light gaps." },
        ],
      },
      {
        title: "Style Options",
        items: [
          { name: "Cassette headrail", description: "Encloses the roll in a fabric-matched or finished housing for a clean, finished look at the top of the window." },
          { name: "Fascia or open roll", description: "A simpler, lower-profile finish at the headrail." },
          { name: "Reverse roll", description: "Rolls the fabric off the back of the tube rather than the front, which can sit closer to the glass and reduce light gaps — available depending on hardware and mount." },
          { name: "Side channels", description: "Tracks along the sides of the window that can significantly reduce light gaps, especially useful with blackout fabrics." },
        ],
      },
      {
        title: "Mount & Hem",
        items: [
          { name: "Inside mount", description: "Fits within the window frame for a built-in look." },
          { name: "Outside mount", description: "Mounts on the wall or trim around the window, which can help maximize coverage and light blockage." },
          { name: "Hem styles", description: "Standard sewn hems or weighted hems to help the shade hang flat and roll evenly." },
        ],
      },
      {
        title: "Operation",
        items: [
          { name: "Manual", description: "Chain-loop or spring-assist operation." },
          { name: "Motorized", description: "Battery, rechargeable, or hardwired motor options — see the motorized shades page for more detail." },
        ],
      },
    ],
    materials: {
      title: "Fabric Colors & Textures",
      intro: "Roller shade fabric is available in a wide range of colors and weave textures, from smooth and minimal to visibly textured. Available options may include:",
      items: [
        { name: "Neutral tones", description: "Whites, creams, taupes, and grays that blend into most interiors." },
        { name: "Woven textures", description: "Visible weave patterns that add subtle texture without pattern or color." },
        { name: "Two-tone and banded fabrics", description: "Layered or dual-fabric options for more design flexibility — see the zebra shades page for banded styles specifically." },
      ],
    },
    howToChoose: [
      "How much privacy do you need, and at what times of day?",
      "Is UV and glare protection a priority, or is room-darkening more important?",
      "How much of the outside view do you want to preserve?",
      "Will the shade be operated often, or mostly left in one position?",
      "Do you want the headrail visible, or fully concealed in a cassette?",
      "Is the window unusually wide or part of a multi-window wall that should read as one continuous treatment?",
      "Are there safety considerations, such as young children, that point toward cordless or motorized operation?",
    ],
    roomSuitability: [
      { room: "Kitchens", note: "Light-filtering or solar fabrics are common for keeping the room bright while cutting glare at the sink or island." },
      { room: "Living rooms", note: "Solar fabrics are popular for large windows where preserving the view matters." },
      { room: "Bedrooms", note: "Room-darkening or blackout fabrics, often with side channels, are common for better sleep." },
      { room: "Media rooms", note: "Blackout fabric is typically the priority here." },
      { room: "Large glass walls", note: "Roller shades scale well across wide spans and multi-panel sliding doors." },
    ],
    care: [
      "Dust regularly with a soft brush or vacuum attachment.",
      "Spot-clean fabric with a lightly damp cloth; avoid saturating the material.",
      "Keep the roller mechanism and brackets free of dust for smooth operation.",
      "Follow any manufacturer-specific fabric care instructions for stain treatment.",
    ],
    faqs: [
      { q: "What's the difference between solar and blackout fabric?", a: "Solar fabric filters UV and glare while generally preserving your view outward. Blackout fabric blocks nearly all light but doesn't preserve visibility through the fabric." },
      { q: "Can I mix light-filtering and blackout in the same window?", a: "Dual or layered roller systems that pair two fabrics on one headrail are available in many product lines, letting you choose between them or use both together — ask your designer whether this is available for your selected collection." },
      { q: "Are roller shades motorized?", a: "Motorized operation is available as an option on most roller shade lines, alongside manual chain-loop and spring-assist operation." },
      { q: "How wide can a single roller shade span?", a: "Many single roller shades can cover quite wide openings as one continuous shade; your measure technician will confirm what's achievable for your specific window and the manufacturer's reinforced-tube options." },
      { q: "Do roller shades work well with sliding glass doors?", a: "Yes — wide or multi-panel roller shades are a common choice for sliding and French doors where a compact, out-of-the-way treatment is wanted." },
      { q: "How do I reduce light gaps around the edges?", a: "Side channels and an outside mount both help reduce light gaps, particularly with blackout fabric." },
      { q: "Are roller shades child-safe?", a: "Cordless and motorized operation, both commonly available, are generally considered safer around children and pets than corded systems." },
      { q: "How long does a custom roller shade take?", a: "Timelines vary by fabric and manufacturer — your designer will confirm a specific estimate for your order." },
    ],
  },

  "motorized-shades": {
    intro: [
      "Motorized shades pair a quiet in-tube motor with almost any shade type — roller, Roman, woven wood, and others — so you can raise, lower, or adjust your window treatments without a cord or wand. Control options range from a simple remote to full smart-home integration.",
      "Motorization is often planned during the same consultation as your fabric or material selection, so the finished result looks intentional rather than added on afterward.",
    ],
    lightControlPrivacy: [
      "Because motorized shades can be grouped and scheduled, they make whole-home light control practical in a way manual operation doesn't — for example, having every west-facing shade lower automatically in the afternoon, or every shade in the house rise together each morning.",
      "The underlying light control and privacy characteristics come from the shade type and fabric you choose, the same as with manual versions — motorization changes how you operate the shade, not what the fabric does.",
    ],
    optionGroups: [
      {
        title: "Compatible Shade Types",
        intro: "Motorization is generally available across:",
        items: [
          { name: "Roller shades", description: "The most common pairing with motorization." },
          { name: "Roman shades", description: "Motorized lift for a softer, folded shade style." },
          { name: "Woven wood shades", description: "Natural-material shades with a motorized lift option." },
          { name: "Other compatible types", description: "Availability varies by manufacturer and product line — your designer will confirm what's motorizable for your selected style." },
        ],
      },
      {
        title: "Control Methods",
        items: [
          { name: "Handheld remote", description: "The simplest control method, often included as standard." },
          { name: "Wall switch or keypad", description: "A fixed control point, similar to a light switch, for one shade or a group." },
          { name: "App control", description: "Control from a smartphone or tablet, often with scheduling." },
          { name: "Voice control", description: "Compatible with many smart-home voice assistants, depending on the system chosen." },
          { name: "Scheduled automation", description: "Shades move automatically at set times or based on sun position, depending on the system." },
        ],
      },
      {
        title: "Power Options",
        items: [
          { name: "Battery or rechargeable", description: "No new wiring required; battery packs are recharged periodically." },
          { name: "Plug-in", description: "Powered from a nearby standard outlet." },
          { name: "Hardwired", description: "Wired directly, typically planned during new construction or a renovation; requires prewiring or an electrician." },
        ],
      },
      {
        title: "Smart-Home & Grouping",
        items: [
          { name: "Group control", description: "Multiple shades in a room or zone can be controlled together as one command." },
          { name: "Scheduled operation", description: "Shades can be set to move at specific times or in response to light." },
          { name: "Smart-home compatibility", description: "Integration with existing smart-home systems depends on the motor and hub you select — your designer will confirm compatibility with your setup." },
        ],
      },
    ],
    materials: {
      title: "Fabric & Material Options",
      intro: "Motorized shades use the same fabric, color, and material options as their manual counterparts — see the roller shades, woven woods, and other relevant service pages for details on the shade type you're considering.",
      items: [
        { name: "Same selection as manual shades", description: "Motorization is an operating system added to your chosen shade type, not a separate product line with its own materials." },
      ],
    },
    howToChoose: [
      "Do you want to motorize every window, or just the hard-to-reach or frequently-used ones?",
      "Is new wiring realistic for your project, or do you need a battery or plug-in solution?",
      "Do you already use a smart-home system you'd want the shades to integrate with?",
      "Would scheduled or grouped operation actually change your daily routine, or is a simple remote enough?",
      "Are there safety or convenience reasons — young children, mobility, very large or high windows — driving the decision?",
    ],
    roomSuitability: [
      { room: "Large or hard-to-reach windows", note: "Often the strongest case for motorization, where manual operation is impractical." },
      { room: "Primary bedrooms", note: "Popular for scheduled wake-up light or bedtime privacy without getting up." },
      { room: "Great rooms and multi-window walls", note: "Grouped control lets many shades move together as one scene." },
      { room: "Nurseries", note: "Removes cords entirely, which is often a priority for child safety." },
      { room: "Home offices", note: "Scheduled operation can help manage screen glare through the day." },
    ],
    care: [
      "Wipe down remotes, keypads, and hubs the same way you would any household electronics.",
      "Follow the specific fabric or material care guidance for whichever shade type you've motorized.",
      "Keep motor housings free of dust, and avoid forcing a shade manually if it's designed to move only by motor.",
      "Recharge or replace batteries as recommended by your manufacturer.",
    ],
    faqs: [
      { q: "Do I need an electrician for motorized shades?", a: "Not necessarily — many installations run on rechargeable battery packs and need no new wiring. Hardwired options are available and would involve coordinating electrical work, which we can help plan." },
      { q: "Which smart-home systems are compatible?", a: "Compatibility depends on the specific motor and hub you select — your designer will confirm what integrates with your existing or planned smart-home system." },
      { q: "How long does the battery last?", a: "Battery life varies by usage, shade size, and motor — your designer can give you a more specific estimate based on the system you choose." },
      { q: "Can existing shades be retrofitted with motors?", a: "In some cases, yes — we can evaluate your current hardware during a consultation and recommend whether retrofitting or replacing makes more sense." },
      { q: "Is motorization noisy?", a: "In-tube motors are generally designed to run quietly, though noise levels can vary by motor and shade size — your designer can show you a working sample." },
      { q: "Can I still operate a motorized shade manually?", a: "This depends on the specific motor and shade — some allow manual override, others are motor-only. Ask your designer about the option you're considering." },
      { q: "What happens during a power outage?", a: "Battery and rechargeable systems are generally unaffected by household power outages; hardwired systems depend on your home's power and any backup you have in place." },
      { q: "Is motorization available on every shade type?", a: "Most shade types can be motorized, but exact availability depends on the manufacturer and product line — your designer will confirm what's possible for the style you want." },
    ],
  },

  "zebra-shades": {
    intro: [
      "Zebra shades — also called banded or dual shades — alternate sheer and solid fabric stripes across a single roll. Sliding the shade up or down shifts the stripes to align or offset, letting you tune light and privacy continuously rather than choosing only between fully open and fully closed.",
      "The clean horizontal banding reads as modern and architectural, and works well in contemporary and transitional interiors.",
    ],
    lightControlPrivacy: [
      "When the sheer and solid bands align, light passes through the sheer sections for a soft, filtered glow while the solid sections maintain some privacy. Offsetting the bands so solid fabric covers the window blocks more light and view.",
      "Daytime versus nighttime privacy is worth discussing with your designer: sheer bands that feel private during the day with outdoor light brighter than indoor light can feel more visible at night once interior lights are on, similar to any sheer fabric.",
    ],
    optionGroups: [
      {
        title: "How Zebra Shades Work",
        items: [
          { name: "Band alignment", description: "Sliding the shade shifts sheer and solid stripes to align for more light, or offset for more privacy." },
          { name: "Continuous adjustment", description: "Unlike a shade that's simply up or down, band position can be fine-tuned to any point in between." },
        ],
      },
      {
        title: "Style Options",
        items: [
          { name: "Cassette headrail", description: "A finished housing at the top of the window, matching the look of a cassette roller shade." },
          { name: "Fabric colors and textures", description: "Available in a range of tones and weave textures to suit different interiors." },
        ],
      },
      {
        title: "Mount & Operation",
        items: [
          { name: "Inside mount", description: "Fits within the window frame." },
          { name: "Outside mount", description: "Mounts on the surrounding wall or trim." },
          { name: "Manual operation", description: "Chain-loop or similar manual control." },
          { name: "Motorized operation", description: "Available on many zebra shade product lines — see the motorized shades page." },
        ],
      },
    ],
    materials: {
      title: "Fabric Colors & Textures",
      intro: "Available options may include a range of neutral and colored fabrics with varying band widths and opacities.",
      items: [
        { name: "Light-filtering bands", description: "Softer sheer sections for a brighter overall look." },
        { name: "Semi-privacy bands", description: "Denser sheer sections for more daytime privacy." },
        { name: "Blackout-backed options", description: "Some product lines offer a blackout backing for more complete light control when needed." },
      ],
    },
    howToChoose: [
      "How much continuous adjustment do you actually want, versus a simpler up/down shade?",
      "Is the window in a bright, glare-heavy exposure where fine light control matters most?",
      "How important is nighttime privacy versus daytime privacy in this room?",
      "Do you want the option to add motorization later, or from the start?",
      "Does the horizontal banding suit the room's overall style?",
    ],
    roomSuitability: [
      { room: "Home offices", note: "Popular for tuning screen glare throughout the day without losing all natural light." },
      { room: "Living rooms", note: "A common choice for west-facing rooms with intense afternoon sun." },
      { room: "Bedrooms", note: "Works well when paired with a blackout-backed option if full darkness is a priority." },
      { room: "Dining rooms", note: "Continuous light adjustment suits rooms used at different times of day." },
    ],
    care: [
      "Dust regularly with a soft brush or vacuum attachment.",
      "Spot-clean with a lightly damp cloth, avoiding saturation of the fabric bands.",
      "Keep the lift mechanism free of dust for smooth band alignment.",
    ],
    faqs: [
      { q: "How is a zebra shade different from a roller shade?", a: "A roller shade is a single fabric layer that's either raised or lowered. A zebra shade has two layers of alternating stripes you slide to continuously adjust light and privacy without fully raising or lowering the shade." },
      { q: "Do zebra shades work well in bright, west-facing rooms?", a: "They're a popular choice for intense afternoon sun because you can fine-tune glare without losing the view entirely." },
      { q: "What fabric weights are available?", a: "Light-filtering, semi-privacy, and some blackout-backed options are generally available — your designer will confirm the current lineup." },
      { q: "Can zebra shades be motorized?", a: "Yes, on many product lines — see the motorized shades page for control and power options." },
      { q: "Do zebra shades fully block light?", a: "Not on their own in most cases — offsetting the bands blocks most light, but a small amount can still pass at the fabric edges. Ask about blackout-backed options if full darkness matters." },
      { q: "Are there light gaps at the sides?", a: "As with most roller-style shades, some light gap is possible at the edges depending on mount type; an outside mount can help minimize this." },
      { q: "How do I clean the fabric bands?", a: "Regular dusting and occasional spot-cleaning with a lightly damp cloth is typically sufficient — see the care section above." },
    ],
  },

  "roman-shades": {
    intro: [
      "Roman shades are a single panel of fabric that stacks into neat horizontal folds as it's raised, rather than rolling around a tube or gathering loosely. The result reads as more tailored and residential than a roller shade — closer to soft furnishing than hardware — while staying simpler to operate than full-length drapery.",
      "Because the whole shade is fabric, Roman shades bring warmth and texture to a window in a way a hard-surface shade can't, while still folding away compactly when raised.",
    ],
    lightControlPrivacy: [
      "Light control and privacy depend on the face fabric and any liner added behind it. Light-filtering fabrics soften daylight while keeping the room bright; a privacy or blackout liner can be added behind almost any face fabric for bedrooms or media rooms without changing how the shade looks from the room.",
      "Because the fabric is a single panel rather than woven bands or slats, a closed Roman shade generally reads as more solidly private than a sheer or woven-wood treatment, though exact coverage depends on the fabric's weight and any liner chosen.",
    ],
    optionGroups: [
      {
        title: "Fold Styles",
        intro: "Available options may include:",
        items: [
          { name: "Flat fold", description: "Lies smooth and flat when lowered, with folds appearing only as the shade is raised — a clean, tailored look." },
          { name: "Relaxed fold", description: "A soft, gentle curve along the bottom edge even when lowered, for a more casual feel." },
          { name: "Structured fold", description: "Crisp, defined horizontal folds held in place by an internal support, visible even when the shade is fully raised." },
        ],
      },
      {
        title: "Liners",
        items: [
          { name: "Privacy liner", description: "Adds opacity behind the face fabric without changing its color or texture from the room side." },
          { name: "Blackout liner", description: "Blocks most light, commonly chosen for bedrooms and media rooms." },
          { name: "No liner", description: "Lets the face fabric's natural light-filtering character come through, for rooms where full privacy isn't the priority." },
        ],
      },
      {
        title: "Mount & Operation",
        items: [
          { name: "Inside mount", description: "Fits within the window frame for a built-in look." },
          { name: "Outside mount", description: "Mounts on the surrounding wall or trim, useful for shallow windows or to make an opening look larger." },
          { name: "Cordless lift", description: "Standard safety-focused operation on most of our Roman shade lines." },
          { name: "Motorized", description: "Available on many product lines — see the motorized shades page for control and power options." },
        ],
      },
    ],
    materials: {
      title: "Fabric Selection",
      intro: "Available in a wide range of fiber types, weights, colors, and patterns. Available options may include:",
      items: [
        { name: "Natural fibers", description: "Linen and cotton-blend fabrics with a relaxed, textural look." },
        { name: "Light-filtering weaves", description: "Softens daylight while keeping the room bright." },
        { name: "Performance fabrics", description: "Woven to better resist fading, often considered for sun-exposed windows." },
      ],
    },
    howToChoose: [
      "Do you want a tailored flat fold, a soft relaxed curve, or crisp structured folds?",
      "Is this shade the primary light control for the room, or will it be layered with drapery?",
      "Does the room need a blackout or privacy liner, or is light-filtering fabric enough?",
      "What's the room's overall palette and formality — does a natural fiber or a more refined weave fit better?",
      "Do you want cordless or motorized operation?",
    ],
    roomSuitability: [
      { room: "Bedrooms", note: "A common choice, often paired with a blackout liner." },
      { room: "Dining rooms", note: "The tailored, soft look suits a more formal dining setting." },
      { room: "Living rooms", note: "Works well alone or layered under drapery for a fuller window treatment." },
      { room: "Kitchens", note: "Flat-fold styles in performance fabric are practical for cooking areas with good natural light." },
      { room: "Home offices", note: "Light-filtering fabric helps manage screen glare while keeping the room bright." },
    ],
    care: [
      "Dust regularly with a soft brush attachment or vacuum on a low setting.",
      "Spot-clean with a lightly damp cloth, avoiding saturation of the fabric.",
      "Keep the lift mechanism free of dust so folds stack evenly.",
      "Follow the specific fabric's care instructions for any deeper cleaning.",
    ],
    faqs: [
      { q: "What's the difference between flat, relaxed, and structured folds?", a: "Flat Roman shades lie smooth when lowered for a tailored look; relaxed styles have a soft curve at the bottom edge; structured styles hold crisp, defined folds even when raised. Your designer can show samples of each in your room." },
      { q: "Can Roman shades provide blackout?", a: "Yes — a blackout liner can be added behind most face fabrics for bedrooms and media rooms, without changing how the fabric looks from the room." },
      { q: "Are Roman shades safe for kids and pets?", a: "Cordless operation is standard on most of our Roman shade lines, which is generally considered safer than corded systems." },
      { q: "Can Roman shades be motorized?", a: "Yes, on many product lines, using the same in-tube motors as our roller and zebra shade lines." },
      { q: "How is a Roman shade different from a roller shade?", a: "A roller shade is a flat fabric plane that rolls around a tube. A Roman shade is a single panel that folds into neat horizontal pleats as it's raised, giving it a softer, more tailored look." },
      { q: "Can Roman shades be layered with drapery?", a: "Yes — pairing a Roman shade with drapery panels is a common way to get both function and a fuller, more finished window." },
      { q: "How are Roman shades cleaned?", a: "Regular dusting and occasional spot-cleaning with a lightly damp cloth is typically sufficient — see the care section above for more detail." },
    ],
  },

  "woven-woods": {
    intro: [
      "Woven wood shades are handwoven from natural materials — bamboo, jute, rattan, and grasses — bringing warmth and texture to a room that fabric alone doesn't replicate. They're a popular choice for coastal, organic, and transitional interiors.",
      "Because each shade is woven from natural material, expect some natural variation in color and weave pattern from panel to panel — this is a characteristic of the material, not a defect.",
    ],
    lightControlPrivacy: [
      "In their natural state, woven wood shades filter light softly but are inherently somewhat sheer — the weave itself lets some light and visibility through even when lowered.",
      "For more privacy or light control, a fabric liner can be added behind the weave, which adds opacity while keeping the woven texture visible from both inside and outside the home.",
    ],
    optionGroups: [
      {
        title: "Materials",
        intro: "Available options may include:",
        items: [
          { name: "Bamboo", description: "A common, renewable material with a range of natural tones." },
          { name: "Jute", description: "A soft, fibrous natural material often used for a more casual, textured look." },
          { name: "Rattan", description: "A woody vine material with a distinct woven texture." },
          { name: "Grasses and blended materials", description: "Various natural grasses and blends of the above materials, depending on the collection." },
        ],
      },
      {
        title: "Fold Styles",
        items: [
          { name: "Flat", description: "Rolls up cleanly without folds, for a simpler stacked look when raised." },
          { name: "Roman-style", description: "Folds into soft horizontal pleats as it's raised, for a more tailored, formal look." },
        ],
      },
      {
        title: "Liners",
        items: [
          { name: "Privacy liner", description: "Adds opacity behind the weave without fully blocking light." },
          { name: "Blackout liner", description: "For rooms where more complete darkness is a priority, such as bedrooms." },
          { name: "Edge binding", description: "A fabric border along the shade's edges, available on some collections for a more finished look." },
        ],
      },
      {
        title: "Mount & Operation",
        items: [
          { name: "Inside mount", description: "Fits within the window frame." },
          { name: "Outside mount", description: "Mounts on the surrounding wall or trim." },
          { name: "Cordless lift", description: "A common safety-focused operating option." },
          { name: "Motorized", description: "Available on many woven wood product lines." },
        ],
      },
    ],
    materials: {
      title: "Natural Material Variation",
      intro: "Because these shades are handwoven from natural fibers, color and weave pattern will vary somewhat between panels and even within a single shade — this is expected and part of the material's character.",
      items: [
        { name: "Color variation", description: "Natural materials absorb dye and age slightly differently piece to piece." },
        { name: "Weave variation", description: "Hand-weaving means no two panels are perfectly identical." },
      ],
    },
    howToChoose: [
      "Do you want a casual, natural look, or a more tailored roman fold for a formal room?",
      "How important is privacy — would a liner be worth adding?",
      "Is the room exposed to regular humidity, which affects material choice and care?",
      "Does the room's palette lean toward warm, organic materials that woven wood would complement?",
      "Do you want cordless or motorized operation for safety or convenience?",
    ],
    roomSuitability: [
      { room: "Sunrooms", note: "A natural fit for the organic, textural look woven wood brings." },
      { room: "Breakfast nooks and kitchens", note: "Popular for casual dining spaces with good natural light." },
      { room: "Living rooms", note: "Works in both casual and more tailored formal rooms depending on weave and fold style." },
      { room: "Bedrooms", note: "Best paired with a liner if privacy or darkness is a priority." },
      { room: "Coastal or transitional interiors", note: "A especially common style pairing for these palettes." },
    ],
    care: [
      "Dust regularly with a soft brush attachment, working with the direction of the weave.",
      "Avoid excess moisture, which can affect natural fibers over time.",
      "Vacuum gently on a low setting if needed, rather than scrubbing the material.",
      "Follow manufacturer guidance for any spot-cleaning, since natural materials vary in how they handle moisture.",
    ],
    faqs: [
      { q: "Are woven woods too casual for a formal living room?", a: "Not necessarily — finer, tighter weaves paired with a tailored roman fold can read as elevated and work well in more formal spaces, while looser weaves suit casual rooms." },
      { q: "Can I get privacy without losing the natural look?", a: "Yes — a fabric liner mounted behind the woven material adds privacy or room-darkening while the woven texture stays visible from both inside and outside." },
      { q: "Do woven woods hold up in humid rooms?", a: "They're generally best suited to living areas, bedrooms, and sunrooms rather than full bathrooms; for consistently humid rooms, a moisture-resistant material like composite shutters is often recommended instead." },
      { q: "What operating systems are available?", a: "Cordless lift and motorized options are commonly available — your designer will confirm what's offered on your selected collection." },
      { q: "Why does my shade look slightly different from the sample?", a: "Natural material variation is expected with handwoven products — color and weave will vary somewhat panel to panel, which is part of the material's character rather than a flaw." },
      { q: "Can woven woods provide blackout for a bedroom?", a: "With a blackout liner added behind the weave, they can get much closer to full room-darkening, though the woven face itself remains naturally textured and not fully opaque." },
      { q: "How are woven wood shades cleaned?", a: "Regular dusting with the direction of the weave, and avoiding excess moisture, is generally recommended — see the care section above for more detail." },
    ],
  },

  "custom-drapery": {
    intro: [
      "Custom drapery is fabric sewn to order to your exact window dimensions, fabric choice, lining, and hardware — the finishing layer that makes a room feel designed rather than simply furnished.",
      "Drapery can stand alone as the primary window treatment, or layer softly over shutters or shades for both function and a more finished, tailored look.",
    ],
    lightControlPrivacy: [
      "Light control and privacy depend heavily on fabric weight and lining. Sheer fabrics filter light softly with minimal privacy; mid-weight fabrics offer a balance; blackout linings block most light for bedrooms and media rooms.",
      "Functional panels that draw closed provide privacy and light control when needed and can be pulled back during the day; stationary panels are decorative and typically paired with a functional shade or shutter behind them for actual light control.",
    ],
    optionGroups: [
      {
        title: "Pleat & Heading Styles",
        intro: "Available options may include:",
        items: [
          { name: "Pinch pleat", description: "A classic, tailored heading with gathered pleats at even intervals." },
          { name: "Ripple fold", description: "A smoother, continuous wave along a specialized track, for a more contemporary look." },
          { name: "Tailored pleat and other headings", description: "Additional heading styles are often available depending on the fabric and hardware chosen — your designer can show samples." },
        ],
      },
      {
        title: "Hardware",
        items: [
          { name: "Decorative rods, rings, and finials", description: "Visible hardware that becomes part of the room's design." },
          { name: "Traversing tracks", description: "Concealed hardware for functional panels that open and close smoothly, often paired with ripple fold." },
        ],
      },
      {
        title: "Panel Types",
        items: [
          { name: "Stationary panels", description: "Decorative framing for the window, typically not meant to close over the glass." },
          { name: "Functional panels", description: "Designed to draw open and closed for actual light control and privacy." },
          { name: "Fullness", description: "Single- or double-width fabric fullness affects how substantial the drapery looks when both open and closed." },
        ],
      },
      {
        title: "Linings",
        items: [
          { name: "Privacy lining", description: "Adds opacity without fully blocking light." },
          { name: "Light-filtering lining", description: "Softens incoming light while preserving some brightness." },
          { name: "Blackout lining", description: "Blocks most light, common in bedrooms and media rooms." },
          { name: "Interlining", description: "An inner layer added for extra body, insulation, and drape, available on some fabric and lining combinations." },
        ],
      },
      {
        title: "Length Considerations",
        items: [
          { name: "Floor length", description: "Hemmed to just graze or clear the floor." },
          { name: "Break", description: "A slight extra length that softly folds at the floor." },
          { name: "Puddle", description: "Noticeably longer, pooling on the floor for a more formal, dramatic look." },
          { name: "Sill-related lengths", description: "Shorter lengths, such as to the sill or apron, for a more casual look in kitchens or smaller rooms." },
        ],
      },
      {
        title: "Layering & Operation",
        items: [
          { name: "Layering over shades or shutters", description: "One of the most common requests — drapery adds softness and framing while the shade or shutter behind it handles daily light control." },
          { name: "Manual operation", description: "Drawn open and closed by hand." },
          { name: "Motorized operation", description: "A traverse track with motorized control, available on many hardware lines." },
        ],
      },
    ],
    materials: {
      title: "Fabric",
      intro: "Available in a wide range of fiber types, weights, patterns, colors, and repeats. Available options may include:",
      items: [
        { name: "Natural fibers", description: "Linen and similar natural-fiber fabrics, with a relaxed, textural drape." },
        { name: "Performance fabrics", description: "Woven to better resist fading and wear, often considered for sun-exposed windows." },
        { name: "Pattern and repeat", description: "Patterned fabrics require extra fabric to match the repeat across panels, which your designer will account for when estimating yardage." },
      ],
    },
    howToChoose: [
      "Is this drapery functional (for daily light control) or primarily decorative?",
      "Will it be layered over an existing or planned shade or shutter?",
      "What length feels right for the room — floor, break, or puddle?",
      "Does the room need blackout or light-filtering lining, or is a lighter fabric enough?",
      "What heading style fits the room's formality — tailored pinch pleat, or a cleaner ripple fold?",
      "Is the window in direct, intense sun where a performance fabric might hold up better over time?",
      "Do you want motorized operation, especially for hard-to-reach or very wide windows?",
    ],
    roomSuitability: [
      { room: "Living rooms", note: "A common place for statement drapery, whether functional or layered over shutters." },
      { room: "Primary bedrooms", note: "Blackout lining is frequently requested here." },
      { room: "Formal dining rooms", note: "Drapery alone, without a shade underneath, is a common choice for a softer, more formal look." },
      { room: "Media rooms", note: "Blackout lining paired with a wide, full-fullness panel helps control light and sound reflection." },
    ],
    care: [
      "Vacuum gently with a brush attachment to remove dust, working top to bottom.",
      "Avoid direct, prolonged sun exposure without a performance or UV-resistant fabric, which can accelerate fading.",
      "Follow the specific fabric's cleaning instructions — many custom drapery fabrics require professional cleaning rather than home laundering.",
      "Check hardware periodically to make sure rings or gliders are moving freely.",
    ],
    faqs: [
      { q: "What pleat styles are available?", a: "Pinch pleat, ripple fold, and other tailored headings are commonly available — your designer can show fabric samples in each style during your in-home consultation." },
      { q: "Can drapery be paired with my existing shutters or shades?", a: "Yes — layering drapery over shutters or shades is one of the most common requests, adding softness and framing without losing function." },
      { q: "Is motorized drapery available?", a: "Yes, on a traverse track with app or remote control, often specified for primary bedrooms and large windows." },
      { q: "How long does custom drapery take to fabricate?", a: "Timelines vary by fabric and hardware lead times — your consultant will provide a specific estimate once your order details are finalized." },
      { q: "Should I choose floor length, break, or puddle?", a: "It's mostly a style preference — floor length and break are more common in everyday living spaces, while puddle length reads as more formal and dramatic." },
      { q: "Do I need blackout lining?", a: "Only if you want the drapery itself to control light significantly — many homeowners rely on a shade or shutter behind the drapery for daily light control instead." },
      { q: "How much fabric fullness do I need?", a: "It depends on how substantial you want the drapery to look, especially when open — your designer will recommend a fullness based on the fabric and window width." },
      { q: "How is custom drapery cleaned?", a: "Most custom drapery fabrics require professional cleaning rather than home laundering — check the specific fabric's care instructions, which your designer can provide." },
    ],
  },

  "exterior-shades": {
    intro: [
      "Exterior shades are solar-mesh screens mounted outside the home — on patios, porches, pergolas, and other covered outdoor spaces — that extend usable living space by cutting heat, glare, and wind-driven debris while generally preserving the view.",
      "Because they're mounted outside the glass line, exterior shades block solar heat before it ever reaches your windows, which is a different approach than an interior shade that only manages light once it's already inside.",
    ],
    lightControlPrivacy: [
      "Performance is described by the mesh's openness factor — lower openness blocks more heat, glare, and view; higher openness preserves more of the view but blocks less heat and light. Your designer will help balance this against your exposure and how you use the space.",
      "Beyond light and heat, mesh density also affects privacy from neighboring yards or the street, which is worth discussing if that's part of why you're considering exterior shades.",
    ],
    optionGroups: [
      {
        title: "Mesh & Openness",
        items: [
          { name: "Solar mesh", description: "A durable, UV-stabilized fabric designed for outdoor exposure." },
          { name: "Openness factor", description: "Determines the balance between heat/glare block and preserved view — available in a range depending on the manufacturer." },
        ],
      },
      {
        title: "Guide Systems",
        intro: "Where available, options may include:",
        items: [
          { name: "Cable-guided", description: "The shade tracks along thin cables at the sides, a lighter-weight guide system." },
          { name: "Track-guided", description: "Solid side tracks that offer more wind resistance and a tighter seal at the edges." },
          { name: "Zip-style", description: "A tensioned edge system, on some product lines, designed to resist wind and reduce side gaps." },
        ],
      },
      {
        title: "Operation",
        items: [
          { name: "Manual", description: "Hand-crank or similar manual operation." },
          { name: "Motorized", description: "Remote or app control, often standard on larger exterior shade installations — see the motorized shades page." },
        ],
      },
      {
        title: "Weather Considerations",
        items: [
          { name: "Wind ratings", description: "Track- and zip-guided systems generally offer more wind resistance than cable-guided systems." },
          { name: "Automatic retraction", description: "Some motorized systems can be set to retract automatically in high wind if paired with a compatible sensor." },
          { name: "Severe weather", description: "As with any outdoor equipment, exterior shades have limitations in severe storms — your installer will go over specific guidance for your system." },
        ],
      },
    ],
    materials: {
      title: "Fabric & Finish Options",
      intro: "Available options may include a range of mesh colors and headbox/frame finishes to coordinate with your home's exterior.",
      items: [
        { name: "Mesh colors", description: "Typically neutral tones designed to blend with outdoor architecture." },
        { name: "Headbox and frame finishes", description: "Coordinating or contrasting finishes to match trim, stone, or other exterior materials." },
      ],
    },
    howToChoose: [
      "Which direction does the space face, and how intense is the sun and heat exposure?",
      "Is privacy from neighbors or the street part of what you're solving for?",
      "How exposed is the space to wind, and would a track- or zip-guided system be worth the added cost?",
      "Do you want manual or motorized operation, especially for wide spans?",
      "Is electrical access available near the mounting location, or does it need to be planned?",
      "What's the mounting surface — stucco, stone, wood — and does it affect hardware options?",
    ],
    roomSuitability: [
      { room: "Covered patios", note: "The most common application, extending comfortable outdoor living time through hot afternoons." },
      { room: "Porches", note: "Effective for both heat and wind-driven debris control." },
      { room: "Pergolas", note: "Often paired with an open structure to add adjustable shade where there was none." },
      { room: "Outdoor kitchens", note: "Helps keep the cooking and dining area usable in direct sun." },
      { room: "West- and south-facing exterior windows", note: "Can reduce heat gain reaching the glass in the first place." },
    ],
    care: [
      "Rinse mesh periodically with water to remove dust and pollen buildup.",
      "Avoid abrasive cleaning tools that could damage the mesh weave.",
      "Check tracks and guides periodically for debris that could affect smooth operation.",
      "Follow manufacturer guidance on retracting the shade before severe weather when possible.",
    ],
    faqs: [
      { q: "Will exterior shades hold up in North Texas storms?", a: "Track- and zip-guided systems generally offer more wind resistance than cable-guided systems, and motorized shades can sometimes be set to auto-retract with a compatible wind sensor. Your installer will go over specific guidance for your system." },
      { q: "Do exterior shades block the view?", a: "It depends on the mesh openness factor you choose — lower openness blocks more heat and glare but also more of the view, while higher openness preserves more visibility. Your designer can help you choose based on your exposure." },
      { q: "Can exterior shades be added to an existing patio cover?", a: "In many cases, yes — most patio and pergola structures can be evaluated for retrofitting; we assess mounting points during your in-home consultation." },
      { q: "How much heat reduction can I expect?", a: "It varies by mesh density, orientation, and exposure — your designer can speak to typical results for a space like yours, though we don't publish fixed performance numbers since conditions vary so much." },
      { q: "Do I need an electrician for motorized exterior shades?", a: "Depending on the system, yes — we'll help plan any needed electrical work as part of your consultation." },
      { q: "Can exterior shades provide privacy as well as shade?", a: "Yes, to a degree — denser mesh options reduce visibility from outside as well as heat and glare, which is worth mentioning during your consultation if privacy is a goal." },
      { q: "How are exterior shades cleaned?", a: "Periodic rinsing with water and checking the tracks for debris is generally sufficient — see the care section above for more detail." },
    ],
  },
};

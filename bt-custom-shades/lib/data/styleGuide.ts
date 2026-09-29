export type DesignStyle = {
  slug: string;
  name: string;
  description: string;
  bestFor: string[];
  visual: "louver" | "roller" | "weave" | "drape" | "mesh";
};

export const designStyles: DesignStyle[] = [
  {
    slug: "modern",
    name: "Modern",
    description:
      "Clean horizontal lines, minimal hardware, and fabric that disappears into the wall when raised. Modern rooms want a window treatment that reads as architecture, not decoration.",
    bestFor: ["Roller Shades", "Zebra Shades", "Motorized Shades"],
    visual: "roller",
  },
  {
    slug: "transitional",
    name: "Transitional",
    description:
      "A blend of clean lines and softer texture — the most common style in North Texas homes. Shutters for structure, paired with simple drapery for warmth.",
    bestFor: ["Plantation Shutters", "Custom Drapery", "Roller Shades"],
    visual: "louver",
  },
  {
    slug: "traditional",
    name: "Traditional",
    description:
      "Layered, tailored, and formal — full-length drapery with real pleat detail, often paired with hardwood shutters underneath for both function and finish.",
    bestFor: ["Custom Drapery", "Plantation Shutters"],
    visual: "drape",
  },
  {
    slug: "organic-natural",
    name: "Organic & Natural",
    description:
      "Woven textures and warm, matte materials over anything glossy or hard-edged. Ideal for rooms that lean coastal, earthy, or Scandinavian.",
    bestFor: ["Woven Woods", "Roller Shades"],
    visual: "weave",
  },
  {
    slug: "minimal",
    name: "Minimal",
    description:
      "As little visual noise as possible. Slim cassette headrails, tone-on-tone fabric, and motorization so no cords or wands interrupt the line of the window.",
    bestFor: ["Roller Shades", "Motorized Shades", "Zebra Shades"],
    visual: "roller",
  },
  {
    slug: "luxury",
    name: "Luxury",
    description:
      "Fully layered windows — hardwood shutters or motorized shades as the functional base, custom drapery as the finishing layer, all specified as one coordinated project.",
    bestFor: ["Custom Drapery", "Plantation Shutters", "Motorized Shades"],
    visual: "drape",
  },
];

export type GalleryItem = {
  id: string;
  category: "Living Room" | "Kitchen" | "Bedroom" | "Office" | "Patio" | "Luxury Homes";
  title: string;
  location: string;
  image: string;
  aspect: "square" | "portrait" | "wide";
};

const rooms: GalleryItem["category"][] = [
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Office",
  "Patio",
  "Luxury Homes",
];

const aspects: GalleryItem["aspect"][] = ["square", "portrait", "wide", "square", "portrait"];

const titles = [
  "Hardwood Shutters, Front Room",
  "Motorized Roller Shades",
  "Layered Drapery & Sheers",
  "Zebra Shades, Bay Window",
  "Woven Wood Roman Shades",
  "Composite Shutters, Kitchen",
  "Exterior Solar Screens",
  "Blackout Cellular Shades",
];

export const galleryItems: GalleryItem[] = Array.from({ length: 24 }, (_, i) => {
  const category = rooms[i % rooms.length];
  const title = titles[i % titles.length];
  const aspect = aspects[i % aspects.length];
  return {
    id: `gallery-${i + 1}`,
    category,
    title,
    location: "Dallas–Fort Worth, TX",
    image: `/images/gallery/gallery-${(i % 12) + 1}.jpg`,
    aspect,
  };
});

export const galleryCategories: GalleryItem["category"][] = [
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Office",
  "Patio",
  "Luxury Homes",
];

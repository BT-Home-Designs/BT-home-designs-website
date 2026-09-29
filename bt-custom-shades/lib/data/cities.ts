export type City = {
  slug: string;
  name: string;
  county: string;
  blurb: string;
  neighborhoods: string[];
  popularServices: string[];
  driveTime: string;
};

export const cities: City[] = [
  {
    slug: "rockwall",
    name: "Rockwall",
    county: "Rockwall County",
    blurb:
      "Lake Ray Hubbard's waterfront homes call for treatments that handle intense reflected light without losing the view — our most-installed combination here is solar roller shades paired with hardwood shutters in formal rooms.",
    neighborhoods: ["The Shores", "Chandlers Landing", "Stone Creek Estates", "Buffalo Creek"],
    popularServices: ["Plantation Shutters", "Roller Shades", "Motorized Shades"],
    driveTime: "25 minutes from our showroom",
  },
  {
    slug: "heath",
    name: "Heath",
    county: "Rockwall County",
    blurb:
      "Heath's larger custom-built lots and estate-style homes are where our full custom drapery and motorized shutter packages get used most — often across ten or more windows in a single project.",
    neighborhoods: ["Buffalo Creek", "Stone Cliff", "Diamond Creek", "Heath Golf and Yacht Club"],
    popularServices: ["Custom Drapery", "Motorized Shades", "Plantation Shutters"],
    driveTime: "30 minutes from our showroom",
  },
  {
    slug: "royse-city",
    name: "Royse City",
    county: "Rockwall / Hunt County",
    blurb:
      "As Royse City's newer master-planned communities fill in, we're fitting a lot of first-time custom treatments — cordless cellular and roller shades for growing families are the most common starting project.",
    neighborhoods: ["Sunset Pointe", "Mallard Park", "Devonshire", "Lakeside"],
    popularServices: ["Roller Shades", "Plantation Shutters", "Zebra Shades"],
    driveTime: "35 minutes from our showroom",
  },
  {
    slug: "forney",
    name: "Forney",
    county: "Kaufman County",
    blurb:
      "Forney's rapid new-construction growth means a lot of builder-grade blinds getting replaced with real hardwood shutters and layered drapery as homeowners settle in and personalize their spaces.",
    neighborhoods: ["Devonshire", "Travis Ranch", "Windmill Farms", "Gateway Parks"],
    popularServices: ["Plantation Shutters", "Custom Drapery", "Roller Shades"],
    driveTime: "30 minutes from our showroom",
  },
  {
    slug: "fate",
    name: "Fate",
    county: "Rockwall County",
    blurb:
      "Fate's family-oriented subdivisions favor cordless, child-safe operation — nearly every project here includes cordless roller or cellular shades in bedrooms and playrooms.",
    neighborhoods: ["Woodcreek", "Williamsburg", "Union Park", "Fate Trails"],
    popularServices: ["Roller Shades", "Zebra Shades", "Plantation Shutters"],
    driveTime: "30 minutes from our showroom",
  },
  {
    slug: "terrell",
    name: "Terrell",
    county: "Kaufman County",
    blurb:
      "Terrell's mix of historic homes near downtown and newer builds further out means we tailor differently by street — restoring true divided-light shutter profiles downtown, and full smart-home motorization in newer builds.",
    neighborhoods: ["Historic Downtown Terrell", "Vista Meadows", "Vintage Lakes"],
    popularServices: ["Plantation Shutters", "Custom Drapery", "Motorized Shades"],
    driveTime: "40 minutes from our showroom",
  },
  {
    slug: "dallas",
    name: "Dallas",
    county: "Dallas County",
    blurb:
      "From high-rise condos in Uptown to estate homes in Preston Hollow, our Dallas projects skew toward motorized shading and designer drapery — floor-to-ceiling glass is the norm, not the exception.",
    neighborhoods: ["Preston Hollow", "Highland Park", "Uptown", "Lakewood", "Bishop Arts"],
    popularServices: ["Motorized Shades", "Custom Drapery", "Roller Shades"],
    driveTime: "Serving all of Dallas",
  },
  {
    slug: "frisco",
    name: "Frisco",
    county: "Collin / Denton County",
    blurb:
      "Frisco's newer luxury builds are our highest-volume smart-home installs — full-house motorization synced to your existing smart-home system is now our default recommendation here, not an upgrade.",
    neighborhoods: ["Starwood", "Phillips Creek Ranch", "Newman Village", "The Trails"],
    popularServices: ["Motorized Shades", "Plantation Shutters", "Custom Drapery"],
    driveTime: "35 minutes from our showroom",
  },
  {
    slug: "plano",
    name: "Plano",
    county: "Collin County",
    blurb:
      "Plano's established neighborhoods bring a lot of shutter replacement work — homeowners upgrading from vinyl mini-blinds to true hardwood shutters, often room by room over a couple of seasons.",
    neighborhoods: ["Willow Bend", "Old Towne Plano", "Legacy West area", "Shoal Creek"],
    popularServices: ["Plantation Shutters", "Roller Shades", "Woven Woods"],
    driveTime: "35 minutes from our showroom",
  },
  {
    slug: "allen",
    name: "Allen",
    county: "Collin County",
    blurb:
      "Allen's family neighborhoods lean toward practical, durable choices — cordless cellular and roller shades in kids' rooms, composite shutters in kitchens and baths.",
    neighborhoods: ["Twin Creeks", "Watters Creek area", "Chase Oaks", "Montgomery Farm"],
    popularServices: ["Plantation Shutters", "Roller Shades", "Zebra Shades"],
    driveTime: "35 minutes from our showroom",
  },
  {
    slug: "mckinney",
    name: "McKinney",
    county: "Collin County",
    blurb:
      "McKinney's blend of historic square homes and new luxury construction keeps our crews fabricating both custom-profile shutters for older openings and full motorized packages for new builds.",
    neighborhoods: ["Historic Downtown McKinney", "Craig Ranch", "Stonebridge Ranch", "Trinity Falls"],
    popularServices: ["Plantation Shutters", "Motorized Shades", "Custom Drapery"],
    driveTime: "35 minutes from our showroom",
  },
  {
    slug: "prosper",
    name: "Prosper",
    county: "Collin / Denton County",
    blurb:
      "Prosper's large-format new construction — big glass walls, tall ceilings, wide door openings — is where our motorized and exterior shade lines get specified most often, frequently as part of the original build-out.",
    neighborhoods: ["Windsong Ranch", "Star Trail", "Whitley Place", "Lakewood at Brookhollow"],
    popularServices: ["Motorized Shades", "Custom Drapery", "Exterior Shades"],
    driveTime: "40 minutes from our showroom",
  },
  {
    slug: "rowlett",
    name: "Rowlett",
    county: "Dallas / Rockwall County",
    blurb:
      "Rowlett's lakeside and family neighborhoods bring a steady mix of roller shades for everyday rooms and hardwood shutters for formal living and dining spaces facing the street.",
    neighborhoods: ["Waterview", "Bayside", "Chiesa Farms", "Lakeside Estates"],
    popularServices: ["Roller Shades", "Plantation Shutters", "Woven Woods"],
    driveTime: "20 minutes from our showroom",
  },
  {
    slug: "garland",
    name: "Garland",
    county: "Dallas County",
    blurb:
      "Garland's long-established neighborhoods mean a lot of full-home refreshes — replacing decades-old blinds and drapery across an entire house in one coordinated project.",
    neighborhoods: ["Firewheel", "Duck Creek", "North Garland", "Old Downtown Garland"],
    popularServices: ["Plantation Shutters", "Custom Drapery", "Roller Shades"],
    driveTime: "20 minutes from our showroom",
  },
  {
    slug: "mesquite",
    name: "Mesquite",
    county: "Dallas County",
    blurb:
      "Mesquite homeowners most often start with a single high-impact room — usually the primary bedroom or living room — before expanding to a full-home shutter and shade package the following season.",
    neighborhoods: ["Creek Crossing", "Rustic Oaks", "Paschall Park", "Sunnyvale border"],
    popularServices: ["Plantation Shutters", "Roller Shades", "Custom Drapery"],
    driveTime: "20 minutes from our showroom",
  },
];

export function getCityBySlug(slug: string) {
  return cities.find((c) => c.slug === slug);
}

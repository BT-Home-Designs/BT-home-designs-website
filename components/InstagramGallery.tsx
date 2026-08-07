import { ImagePlaceholder } from "./ImagePlaceholder";
import { InstagramIcon } from "./icons";
import { business } from "@/lib/data/business";

export function InstagramGallery() {
  const href = business.social.instagram || "#";

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-2">
        <InstagramIcon className="h-4 w-4 text-oak-dark" />
        <a
          href={href}
          target={business.social.instagram ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="text-[13px] font-medium tracking-wide text-charcoal hover:text-oak-dark"
        >
          @bthomedesigns
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <a
            key={i}
            href={href}
            target={business.social.instagram ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden"
          >
            <ImagePlaceholder
              variant={i % 2 === 0 ? "oak" : "charcoal"}
              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

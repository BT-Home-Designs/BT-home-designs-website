import type { GuideOptionGroup } from "@/lib/data/serviceGuides";

export function OptionGroupCards({ group }: { group: GuideOptionGroup }) {
  return (
    <div>
      <h3 className="font-display text-xl text-charcoal md:text-2xl">{group.title}</h3>
      {group.intro && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-charcoal-soft">{group.intro}</p>}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.items.map((item) => (
          <div key={item.name} className="rounded-sm border border-charcoal/10 bg-warm-white p-5">
            <p className="font-display text-base text-charcoal">{item.name}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-soft">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

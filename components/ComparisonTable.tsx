import type { ComparisonTable as ComparisonTableData } from "@/lib/data/serviceGuides";

export function ComparisonTable({ table }: { table: ComparisonTableData }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-charcoal/10">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="bg-cream">
            {table.columns.map((col) => (
              <th key={col} className="border-b border-charcoal/10 px-5 py-3.5 font-semibold uppercase tracking-wide text-charcoal-soft text-[11px]">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-cream/40" : undefined}>
              {row.map((cell, j) => (
                <td key={j} className={`border-b border-charcoal/10 px-5 py-4 align-top text-charcoal-soft ${j === 0 ? "font-medium text-charcoal" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

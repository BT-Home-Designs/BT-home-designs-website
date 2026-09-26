/**
 * Shared definitions for the How to Measure worksheet and its submission
 * route (components/MeasurementWorksheet.tsx, components/MeasurementSubmitForm.tsx,
 * app/api/measurements/route.ts). Client and server both import from here so
 * option lists and limits can't drift apart.
 */

export type WorksheetRow = {
  id: string;
  room: string;
  treatment: string;
  mount: string;
  width: string;
  height: string;
  floor: string;
  extra: string;
  notes: string;
};

export const WORKSHEET_FIELDS = ["room", "treatment", "mount", "width", "height", "floor", "extra", "notes"] as const;
export type WorksheetField = (typeof WORKSHEET_FIELDS)[number];

export const WORKSHEET_LABELS: Record<WorksheetField, string> = {
  room: "Room / window",
  treatment: "Treatment",
  mount: "Mount",
  width: "Width (in)",
  height: "Height (in)",
  floor: "Floor",
  extra: "Additional",
  notes: "Notes",
};

export const WORKSHEET_TREATMENTS = [
  "Custom Drapery",
  "Roman Shades",
  "Valance",
  "Roller Shades",
  "Zebra Shades",
  "Woven Woods",
  "Blinds",
  "Plantation Shutters",
  "Motorized Shades",
  "Exterior Shades",
  "Not sure yet",
];

export const MOUNT_OPTIONS = ["Inside mount", "Outside mount", "Not sure", "Doesn't apply"];

export const FLOOR_OPTIONS = ["Carpet", "Hard flooring", "Not sure"];

/** Treatments where the floor type matters (drapery length). */
export const FLOOR_TREATMENTS = ["Custom Drapery"];

export const WORKSHEET_FIELD_LIMITS: Record<WorksheetField, number> = {
  room: 120,
  treatment: 60,
  mount: 30,
  width: 120,
  height: 120,
  floor: 30,
  extra: 300,
  notes: 1000,
};

export const MAX_WORKSHEET_ROWS = 40;

/**
 * Photo limits. Photos are downscaled in the browser before upload (see
 * MeasurementSubmitForm), so typical phone photos land well under the
 * per-photo cap. The combined cap matches app/api/warranty/route.ts — it
 * keeps the whole request under Vercel's ~4.5MB serverless body limit.
 */
export const MEASUREMENT_PHOTOS = {
  maxPhotos: 10,
  maxPhotoBytes: 3 * 1024 * 1024,
  maxTotalBytes: 4 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxLabelLength: 120,
};

export function emptyRow(id: string): WorksheetRow {
  return { id, room: "", treatment: "", mount: "", width: "", height: "", floor: "", extra: "", notes: "" };
}

export function isRowFilled(r: Pick<WorksheetRow, WorksheetField>): boolean {
  return WORKSHEET_FIELDS.some((k) => r[k].trim() !== "");
}

/** Plain-text summary used by "Copy as text" and the notification email. */
export function worksheetToText(rows: Pick<WorksheetRow, WorksheetField>[]): string {
  return rows
    .map((r, i) => {
      const lines = [`${i + 1}. ${r.room.trim() || "Unnamed window"}`];
      for (const k of WORKSHEET_FIELDS) {
        if (k === "room" || !r[k].trim()) continue;
        lines.push(`   ${WORKSHEET_LABELS[k]}: ${r[k].trim()}`);
      }
      return lines.join("\n");
    })
    .join("\n");
}

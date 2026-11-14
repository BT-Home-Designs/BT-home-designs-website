import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { todayInBusinessTz } from "./calc";
import { newId } from "./ids";
import { sanitizeContent } from "./sanitize";
import { createQuote } from "./service";
import { getStore } from "./store";

/**
 * Creates a clearly-labeled SAMPLE quote for previewing the feature.
 * Mirrors the structure of the Little Elm drapery quote and adds a
 * second treatment type. Payment links point at Square's SANDBOX domain
 * (squareupsandbox.com), which cannot move real money.
 */
export async function createSampleQuote() {
  const store = await getStore();
  const sampleQuoteId = newId(); // only used to tag stored files
  const photo = async (file: string) => {
    const data = await fs.readFile(path.join(process.cwd(), "public", "images", file));
    const id = newId();
    await store.putFile(id, sampleQuoteId, { mime: "image/jpeg", data });
    return id;
  };
  const [drapery, roman, roller, motorized, about] = await Promise.all([
    photo("services/custom-drapery.jpg"),
    photo("services/roman-shades.jpg"),
    photo("services/roller-shades.jpg"),
    photo("services/motorized-shades.jpg"),
    photo("home/about.jpg"),
  ]);

  const today = todayInBusinessTz();
  const expires = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const sel = (label: string, value: string) => ({ id: newId(), label, value });

  const content = sanitizeContent({
    isSample: true,
    customer: { name: "SAMPLE Customer (not a real client)", email: "", phone: "", address: "Little Elm, TX" },
    projectName: "SAMPLE — Little Elm Residence",
    coverTitle: "Custom Drapery & Shade Quote",
    intro:
      "SAMPLE DATA FOR PREVIEW ONLY. BT Home Designs creates custom window treatment solutions tailored to each space. This quote presents a Marine drapery direction for the slider and living room — two split-draw pairs on matching traverse tracks in Matte Black — plus motorized roller shades for the primary bedroom.",
    quoteDate: today,
    expirationDate: expires,
    coverPhotoId: drapery,
    pages: [
      {
        id: newId(),
        title: "Drapery Design Direction",
        room: "Slider + Living Room",
        treatment: "Custom Drapery",
        description: "Two split-draw pairs in DrapeMax Union, Marine, with white light-filtering lining.",
        selections: [
          sel("Fabric", "Union — DrapeMax"),
          sel("Color", "Marine"),
          sel("Lining", "White light-filtering"),
          sel("Style", "Two-finger pleat, 1.25x standard fullness, split-draw pairs, floor length 105\""),
          sel("Slider pair", "118\" coverage — left panel motorized, right panel manual"),
          sel("Living room pair", "138 1/2\" coverage — three windows as one opening, center draw"),
        ],
        photos: [
          { id: drapery, caption: "Pinch pleat — 2 finger", selected: true },
          { id: roman, caption: "Alternate: flat Roman (not selected)", selected: false },
          { id: about, caption: "Inspiration", selected: false },
        ],
      },
      {
        id: newId(),
        title: "Hardware Direction",
        room: "Slider + Living Room",
        treatment: "Hardware",
        description:
          "Matching traverse tracks on both openings, so the two treatments read as one set. Rowley AriA hardware — finish: Matte Black on both tracks.",
        selections: [
          sel("System", "Rowley AriA traverse system"),
          sel("Finish", "Matte Black, both tracks"),
          sel("Slider (118\")", "Motorized traverse track — battery motor, 5-channel remote"),
          sel("Living room (139\")", "Manual traverse track, center split"),
        ],
        photos: [],
      },
      {
        id: newId(),
        title: "Primary Bedroom Shades",
        room: "Primary Bedroom",
        treatment: "Motorized Shades",
        description: "Blackout roller shades, inside mount, motorized with remote.",
        selections: [sel("Fabric", "Blackout — Linen White"), sel("Mount", "Inside mount"), sel("Control", "Rechargeable motor, remote")],
        photos: [
          { id: motorized, caption: "Motorized roller shade", selected: true },
          { id: roller, caption: "Fabric reference", selected: false },
        ],
      },
    ],
    lineItems: [
      { room: "Slider", description: "Motorized opening — custom draperies + motorized traverse system", quantity: 1, unitPriceCents: 313017, taxable: true, internalCostCents: 190000 },
      { room: "Living Room", description: "Non-motorized opening — custom draperies + traverse track", quantity: 1, unitPriceCents: 178705, taxable: true, internalCostCents: 105000 },
      { room: "Primary Bedroom", description: "Motorized blackout roller shade", quantity: 2, unitPriceCents: 64950, taxable: true, internalCostCents: 38000 },
      { room: "All rooms", description: "Installation", quantity: 1, unitPriceCents: 65126, taxable: true, internalCostCents: null },
    ],
    taxRatePercent: 8.25,
    deposit: { mode: "percent", percent: 50, amountCents: 0 },
    paymentLinks: {
      deposit: { url: "https://squareupsandbox.com/pay-invoice/SAMPLE-DEPOSIT-LINK", label: "Pay Deposit" },
      full: { url: "https://squareupsandbox.com/pay-invoice/SAMPLE-FULL-LINK", label: "Pay in Full" },
      balance: { url: "https://squareupsandbox.com/pay-invoice/SAMPLE-BALANCE-LINK", label: "Pay Remaining Balance" },
    },
    requireApprovalBeforePayment: true,
    terms: [
      {
        title: "Payment & Order (SAMPLE — replace with your terms)",
        body: "Draperies are paid before the order is released to the workroom.\nHardware is invoiced with the order — pricing final, above.\nCustom orders are non-returnable once placed.",
      },
      {
        title: "Lead Time (SAMPLE)",
        body: "Custom drapery: production time confirmed at order (estimate 6–8 weeks).\nTraverse hardware: approximately 5 business days once ordered.\nFinal dates are confirmed after the order is accepted and materials are available.",
      },
      {
        title: "Warranty (SAMPLE)",
        body: "Motorized drapery motor: 5-year manufacturer warranty on the selected motor system.\nCustom workroom products may be returned only for defective workmanship, subject to manufacturer/workroom terms.\nBT Home Designs will assist with eligible warranty service.",
      },
    ],
    approvalStatement:
      "By approving, the client approves the project specifications and authorizes BT Home Designs to place the custom order once payment terms above are met. Final measurements and hardware/finish selections will be verified before ordering.",
    internalNotes:
      "SAMPLE QUOTE. Terms text is copied from the Little Elm drape quote PDF for illustration only; the 50% deposit is a sample setting. Internal costs above are made-up sample numbers to show they never appear on customer pages.",
  });
  return createQuote(content);
}

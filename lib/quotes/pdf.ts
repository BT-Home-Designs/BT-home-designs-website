import "server-only";
import { promises as fs } from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { formatDate, formatDateTime, formatQty } from "./format";
import { formatCents } from "./money";
import { getStore } from "./store";
import type { CustomerQuoteView } from "./view";

/**
 * Upright landscape Letter (11 × 8.5 in) PDF built from the SAME
 * CustomerQuoteView the web presentation uses — so the numbers can never
 * disagree with the page, and internal cost/notes can never appear (they
 * aren't in the view). Mirrors the presentation: cover → design pages →
 * pricing → terms & approval. Uses PDF built-in fonts (no font files).
 */

const W = 792;
const H = 612;
const M = 44; // side margin
const TOP = 40;
const BOTTOM = H - 46; // content must end above the footer
const C = { green: "#23392b", gold: "#b08d35", goldLight: "#e2c47e", cream: "#f8f5ec", ink: "#2a2622", soft: "#5a554d", rule: "#d9c9a0" };
const SERIF_BOLD = "Times-Bold";
const SERIF = "Times-Roman";
const SANS = "Helvetica";
const SANS_BOLD = "Helvetica-Bold";

type Doc = PDFKit.PDFDocument;
type Img = Buffer;

async function loadImages(view: CustomerQuoteView): Promise<Map<string, Img>> {
  const store = await getStore();
  const ids = new Set<string>();
  if (view.coverPhotoId) ids.add(view.coverPhotoId);
  view.pages.forEach((p) => p.photos.forEach((ph) => ids.add(ph.id)));
  const map = new Map<string, Img>();
  await Promise.all(
    [...ids].map(async (id) => {
      const f = await store.getFile(id);
      if (f && (f.mime === "image/jpeg" || f.mime === "image/png")) map.set(id, f.data);
    })
  );
  return map;
}

/** Draw an image cropped to fill a box (object-fit: cover). */
function coverImage(doc: Doc, img: Img, x: number, y: number, w: number, h: number) {
  doc.save();
  doc.rect(x, y, w, h).clip();
  try {
    doc.image(img, x, y, { cover: [w, h], align: "center", valign: "center" });
  } catch {
    doc.rect(x, y, w, h).fill("#e7dac6");
  }
  doc.restore();
}

function roundLogo(doc: Doc, logo: Img, x: number, y: number, size: number) {
  doc.save();
  doc.circle(x + size / 2, y + size / 2, size / 2).clip();
  doc.image(logo, x, y, { width: size, height: size });
  doc.restore();
  doc.circle(x + size / 2, y + size / 2, size / 2).lineWidth(0.8).stroke(C.gold);
}

function eyebrow(doc: Doc, text: string, x: number, y: number, width: number) {
  doc.font(SANS_BOLD).fontSize(8).fillColor(C.gold).text(text.toUpperCase(), x, y, { width, characterSpacing: 1.6, lineBreak: true });
  return doc.y;
}

function goldRule(doc: Doc, x: number, y: number, w: number) {
  doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.8).stroke(C.rule);
  const cx = x + w / 2;
  doc.save().translate(cx, y).rotate(45).rect(-2.5, -2.5, 5, 5).fill(C.gold).restore();
}

function pageTitle(doc: Doc, title: string, sub: string) {
  doc.font(SERIF_BOLD).fontSize(26).fillColor(C.green).text(title, M, TOP, { width: W - 2 * M });
  let y = doc.y + 2;
  if (sub) y = eyebrow(doc, sub, M, y, W - 2 * M) + 2;
  goldRule(doc, M, y + 8, W - 2 * M);
  return y + 22;
}

function labelValueRow(doc: Doc, label: string, value: string, x: number, y: number, w: number) {
  const lw = w * 0.34;
  const vw = w - lw - 8;
  doc.font(SANS_BOLD).fontSize(7.5);
  const lh = doc.heightOfString(label.toUpperCase(), { width: lw, characterSpacing: 0.8 });
  doc.font(SANS).fontSize(10.5);
  const vh = doc.heightOfString(value, { width: vw, lineGap: 1.5 });
  return {
    height: Math.max(lh, vh) + 10,
    draw: (yy: number) => {
      doc.font(SANS_BOLD).fontSize(7.5).fillColor(C.gold).text(label.toUpperCase(), x, yy + 6, { width: lw, characterSpacing: 0.8 });
      doc.font(SANS).fontSize(10.5).fillColor(C.ink).text(value, x + lw + 8, yy + 4.5, { width: vw, lineGap: 1.5 });
      doc.moveTo(x, yy + Math.max(lh, vh) + 10).lineTo(x + w, yy + Math.max(lh, vh) + 10).lineWidth(0.4).stroke(C.rule);
    },
  };
}

export async function renderQuotePdf(view: CustomerQuoteView): Promise<Buffer> {
  const [images, logo] = await Promise.all([loadImages(view), fs.readFile(path.join(process.cwd(), "public", "images", "brand", "bt-logo-240.png"))]);

  const doc = new PDFDocument({
    size: "LETTER",
    layout: "landscape",
    margins: { top: TOP, bottom: 20, left: M, right: M },
    bufferPages: true,
    info: { Title: `Quote ${view.number}`, Author: "BT Home Designs", Subject: view.projectName, Creator: "BT Home Designs" },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const paintBg = () => doc.rect(0, 0, W, H).fill(C.cream);
  doc.on("pageAdded", paintBg);
  paintBg();

  // ------------------------------------------------------------------ cover
  const leftW = Math.round(W * 0.4);
  doc.rect(0, 0, leftW, H).fill(C.green);
  const cover = view.coverPhotoId ? images.get(view.coverPhotoId) : undefined;
  if (cover) coverImage(doc, cover, 0, 0, leftW, H);
  else roundLogo(doc, logo, leftW / 2 - 80, H / 2 - 80, 160);

  const rx = leftW + 44;
  const rw = W - rx - 44;
  let y = 150;
  roundLogo(doc, logo, rx, y - 70, 52);
  doc.font(SERIF_BOLD).fontSize(32).fillColor(C.green).text(view.projectName || view.customerName, rx, y, { width: rw });
  y = doc.y + 2;
  if (view.coverTitle) {
    doc.font(SERIF).fontSize(18).fillColor(C.ink).text(view.coverTitle, rx, y, { width: rw });
    y = doc.y + 4;
  }
  if (view.treatments.length) y = eyebrow(doc, view.treatments.join(" + "), rx, y, rw) + 4;
  goldRule(doc, rx, y + 6, rw);
  y += 20;
  if (view.intro) {
    doc.font(SANS).fontSize(10.5).fillColor(C.soft).text(view.intro, rx, y, { width: rw, lineGap: 2.5, height: 150, ellipsis: true });
    y = doc.y + 14;
  }
  const meta = (
    [
      ["Prepared for", view.customerName],
      ["Quote", view.number],
      ["Date", formatDate(view.quoteDate)],
      ["Valid until", formatDate(view.expirationDate)],
    ] as [string, string][]
  ).filter(([, v]) => v);
  meta.forEach(([k, v], i) => {
    const mx = rx + (i % 2) * (rw / 2);
    const my = y + Math.floor(i / 2) * 34;
    doc.font(SANS_BOLD).fontSize(7.5).fillColor(C.gold).text(k.toUpperCase(), mx, my, { width: rw / 2 - 10, characterSpacing: 1.2 });
    doc.font(SANS).fontSize(10.5).fillColor(C.ink).text(v, mx, my + 11, { width: rw / 2 - 10 });
  });
  y += Math.ceil(meta.length / 2) * 34 + 6;
  if (view.isSample || view.isPreview) {
    doc
      .font(SANS_BOLD)
      .fontSize(9)
      .fillColor("#7a5d17")
      .text([view.isPreview && "DRAFT PREVIEW — NOT SENT TO CUSTOMER", view.isSample && "SAMPLE QUOTE — DEMO DATA ONLY"].filter(Boolean).join("  ·  "), rx, y, { width: rw });
  }

  // ----------------------------------------------------------- design pages
  for (const page of view.pages) {
    doc.addPage();
    const sub = [view.projectName, page.room, page.treatment].filter(Boolean).join(" · ");
    let top = pageTitle(doc, page.title || page.room || "Design", sub);
    const photos = page.photos.filter((p) => images.has(p.id));
    const full = W - 2 * M;
    const colW = photos.length ? full * 0.46 : full;
    const photoX = M + colW + 24;
    const photoW = full - colW - 24;

    // photos (right column, first page of this design only)
    if (photos.length) {
      const heroH = 220;
      coverImage(doc, images.get(photos[0].id)!, photoX, top, photoW, heroH);
      if (photos[0].selected) doc.rect(photoX, top, photoW, heroH).lineWidth(2).stroke(C.gold);
      let py = top + heroH + 3;
      if (photos[0].caption || photos[0].selected) {
        doc
          .font(photos[0].selected ? SANS_BOLD : SANS)
          .fontSize(8)
          .fillColor(photos[0].selected ? C.gold : C.soft)
          .text(`${photos[0].selected ? "SELECTED · " : ""}${photos[0].caption}`, photoX, py, { width: photoW, align: "center" });
        py = doc.y;
      }
      py += 8;
      const thumbs = photos.slice(1, 7);
      const tw = (photoW - 16) / 3;
      const th = 74;
      thumbs.forEach((ph, i) => {
        const tx = photoX + (i % 3) * (tw + 8);
        const ty = py + Math.floor(i / 3) * (th + 24);
        if (ty + th > BOTTOM) return;
        coverImage(doc, images.get(ph.id)!, tx, ty, tw, th);
        if (ph.selected) doc.rect(tx, ty, tw, th).lineWidth(2).stroke(C.gold);
        if (ph.caption || ph.selected) {
          doc
            .font(ph.selected ? SANS_BOLD : SANS)
            .fontSize(7.5)
            .fillColor(ph.selected ? C.gold : C.soft)
            .text(`${ph.selected ? "SELECTED · " : ""}${ph.caption}`, tx, ty + th + 2, { width: tw, align: "center", height: 20, ellipsis: true });
        }
      });
    }

    // description + selections (left column; continues onto extra pages if long)
    let ly = top;
    if (page.description) {
      doc.font(SANS).fontSize(10.5).fillColor(C.soft).text(page.description, M, ly, { width: colW, lineGap: 2.5 });
      ly = doc.y + 10;
    }
    for (const sel of page.selections) {
      const row = labelValueRow(doc, sel.label, sel.value, M, ly, colW);
      if (ly + row.height > BOTTOM) {
        doc.addPage();
        top = pageTitle(doc, `${page.title || page.room} (continued)`, sub);
        ly = top;
      }
      row.draw(ly);
      ly += row.height;
    }
  }

  // ---------------------------------------------------------------- pricing
  doc.addPage();
  const pricingSub = [view.projectName, `Quote ${view.number}`].filter(Boolean).join(" | ");
  let py = pageTitle(doc, "Final Pricing", pricingSub);
  const t = view.totals;
  const full = W - 2 * M;
  const listW = full * 0.6;
  const boxX = M + listW + 28;
  const boxW = full - listW - 28;

  // totals box (right column on the first pricing page)
  let by = py;
  const sumRow = (label: string, value: string, bold = false, color = C.ink, size = 10.5) => {
    doc.font(bold ? SANS_BOLD : SANS).fontSize(size).fillColor(color).text(label, boxX, by, { width: boxW * 0.6 });
    doc.font(SANS_BOLD).fontSize(size).fillColor(color).text(value, boxX + boxW * 0.4, by, { width: boxW * 0.6, align: "right" });
    by += size + 8;
  };
  sumRow("Subtotal", formatCents(t.subtotalCents));
  sumRow(`Tax (${t.taxRatePercent}%)`, formatCents(t.taxCents));
  by += 2;
  doc.roundedRect(boxX, by, boxW, 66, 4).fill(C.green);
  doc.font(SANS_BOLD).fontSize(7.5).fillColor(C.goldLight).text("PROJECT TOTAL", boxX, by + 12, { width: boxW, align: "center", characterSpacing: 1.6 });
  doc.font(SERIF_BOLD).fontSize(26).fillColor(C.cream).text(formatCents(t.totalCents), boxX, by + 26, { width: boxW, align: "center" });
  by += 80;
  const balTop = by;
  by += 10;
  const inner = (label: string, value: string, bold = false, size = 10) => {
    doc.font(bold ? SANS_BOLD : SANS).fontSize(size).fillColor(bold ? C.green : C.ink).text(label, boxX + 10, by, { width: boxW * 0.6 });
    doc.font(bold ? SANS_BOLD : SANS).fontSize(size).fillColor(bold ? C.green : C.ink).text(value, boxX + boxW * 0.4 - 10, by, { width: boxW * 0.6, align: "right" });
    by += size + 7;
  };
  if (t.depositCents > 0) inner("Deposit required", formatCents(t.depositCents), true);
  inner("Payments received", formatCents(t.paidCents));
  for (const p of view.payments.slice(0, 8)) inner(`   ${formatDate(p.date)}`, formatCents(p.amountCents), false, 8.5);
  doc.moveTo(boxX + 10, by).lineTo(boxX + boxW - 10, by).lineWidth(0.5).stroke(C.rule);
  by += 6;
  inner("Remaining balance", formatCents(Math.max(0, t.remainingCents)), true);
  doc.roundedRect(boxX, balTop, boxW, by - balTop + 4, 4).lineWidth(0.75).stroke(C.rule);
  by += 12;
  doc
    .font(SANS)
    .fontSize(8)
    .fillColor(C.soft)
    .text(`Status: ${view.statusLabel}. Payments are reflected once confirmed and recorded by BT Home Designs.`, boxX, by, { width: boxW });

  // line items (left column; paginates cleanly, never splitting a row)
  for (const item of view.lineItems) {
    const descW = listW * 0.74;
    doc.font(SANS).fontSize(11);
    let h = doc.heightOfString(item.description || " ", { width: descW }) + 14;
    if (item.room) h += 11;
    if (item.quantity !== 1) h += 12;
    if (py + h > BOTTOM) {
      doc.addPage();
      py = pageTitle(doc, "Final Pricing (continued)", pricingSub);
    }
    let iy = py + 7;
    if (item.room) {
      doc.font(SANS_BOLD).fontSize(7.5).fillColor(C.gold).text(item.room.toUpperCase(), M, iy, { width: descW, characterSpacing: 1 });
      iy += 11;
    }
    doc.font(SANS).fontSize(11).fillColor(C.ink).text(item.description, M, iy, { width: descW });
    iy = doc.y;
    if (item.quantity !== 1) {
      doc.font(SANS).fontSize(8.5).fillColor(C.soft).text(`${formatQty(item.quantity)} × ${formatCents(item.unitPriceCents)}`, M, iy + 1, { width: descW });
    }
    doc.font(SANS_BOLD).fontSize(11).fillColor(C.ink).text(formatCents(item.totalCents), M + descW, py + 7 + (item.room ? 11 : 0), { width: listW - descW, align: "right" });
    py += h;
    doc.moveTo(M, py).lineTo(M + listW, py).lineWidth(0.4).stroke(C.rule);
  }

  // ------------------------------------------------------- terms & approval
  doc.addPage();
  const termsSub = view.projectName;
  let ty = pageTitle(doc, "Terms & Project Agreement", termsSub);
  const colGap = 14;
  const cardW = view.terms.length > 1 ? (full - colGap) / 2 : full;
  const pad = 12;
  const colY = [ty, ty];
  const measureCard = (title: string, body: string) => {
    let h = pad * 2;
    if (title) {
      doc.font(SANS_BOLD).fontSize(9.5);
      h += doc.heightOfString(title.toUpperCase(), { width: cardW - 2 * pad }) + 5;
    }
    doc.font(SANS).fontSize(9.5);
    h += doc.heightOfString(body || " ", { width: cardW - 2 * pad, lineGap: 2 });
    return h;
  };
  const drawCard = (title: string, body: string, x: number, yy: number, h: number) => {
    doc.roundedRect(x, yy, cardW, h, 7).lineWidth(0.75).stroke(C.gold);
    let cy = yy + pad;
    if (title) {
      doc.font(SANS_BOLD).fontSize(9.5).fillColor(C.green).text(title.toUpperCase(), x + pad, cy, { width: cardW - 2 * pad });
      cy = doc.y + 5;
    }
    doc.font(SANS).fontSize(9.5).fillColor(C.soft).text(body, x + pad, cy, { width: cardW - 2 * pad, lineGap: 2 });
  };
  const maxCardH = BOTTOM - (TOP + 60);
  for (const term of view.terms) {
    const h = measureCard(term.title, term.body);
    if (h > maxCardH) {
      // Very long section: flow it as plain text across pages (no box).
      doc.addPage();
      doc.font(SANS_BOLD).fontSize(11).fillColor(C.green).text(term.title.toUpperCase(), M, TOP, { width: full });
      doc.font(SANS).fontSize(9.5).fillColor(C.soft).text(term.body, M, doc.y + 4, { width: full, lineGap: 2 });
      doc.addPage();
      ty = pageTitle(doc, "Terms & Project Agreement (continued)", termsSub);
      colY[0] = colY[1] = ty;
      continue;
    }
    const col = view.terms.length > 1 && colY[1] < colY[0] ? 1 : 0;
    if (colY[col] + h > BOTTOM) {
      doc.addPage();
      ty = pageTitle(doc, "Terms & Project Agreement (continued)", termsSub);
      colY[0] = colY[1] = ty;
    }
    const c2 = view.terms.length > 1 && colY[1] < colY[0] ? 1 : 0;
    drawCard(term.title, term.body, M + c2 * (cardW + colGap), colY[c2], h);
    colY[c2] += h + 12;
  }

  // approval block
  let ay = Math.max(colY[0], colY[1]);
  doc.font(SANS).fontSize(10.5);
  const stmtH = view.approvalStatement ? doc.heightOfString(view.approvalStatement, { width: full - 2 * pad, lineGap: 2 }) + 8 : 0;
  const blockH = pad * 2 + stmtH + (view.approval ? 18 : 46);
  if (ay + blockH > BOTTOM) {
    doc.addPage();
    ay = pageTitle(doc, "Project Agreement", termsSub);
  }
  doc.roundedRect(M, ay, full, blockH, 7).lineWidth(0.75).stroke(C.gold);
  let iy2 = ay + pad;
  if (view.approvalStatement) {
    doc.font(SANS).fontSize(10.5).fillColor(C.ink).text(view.approvalStatement, M + pad, iy2, { width: full - 2 * pad, lineGap: 2 });
    iy2 = doc.y + 8;
  }
  if (view.approval) {
    doc
      .font(SANS_BOLD)
      .fontSize(10.5)
      .fillColor(C.green)
      .text(`Approved electronically by ${view.approval.name} on ${formatDateTime(view.approval.at)} — quote version ${view.approval.version}.`, M + pad, iy2, {
        width: full - 2 * pad,
      });
  } else {
    const lw = (full - 2 * pad - 40) / 3;
    ["Client Signature", "Date", "Printed Name"].forEach((l, i) => {
      const lx = M + pad + i * (lw + 20);
      doc.moveTo(lx, iy2 + 26).lineTo(lx + lw, iy2 + 26).lineWidth(0.7).stroke(C.ink);
      doc.font(SANS).fontSize(8).fillColor(C.soft).text(l, lx, iy2 + 29, { width: lw });
    });
  }

  // ------------------------------------------------------- footers (all pages)
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const fy = H - 30;
    const left = "BT Home Designs · Custom Window Treatments · bthomedesigns.com";
    const mid = `Quote ${view.number} · v${view.version}${view.isSample ? " · SAMPLE" : ""}${view.isPreview ? " · DRAFT PREVIEW" : ""}`;
    doc.font(SANS).fontSize(7.5).fillColor(C.soft);
    if (i !== range.start) {
      // The cover's left half is a photo/green panel, so it only gets a page number.
      doc.text(left, M, fy, { width: 300, lineBreak: false });
      doc.text(mid, W / 2 - 150, fy, { width: 300, align: "center", lineBreak: false });
    }
    doc.text(`Page ${i - range.start + 1} of ${range.count}`, W - M - 150, fy, { width: 150, align: "right", lineBreak: false });
  }

  doc.end();
  return done;
}

export function pdfFilename(view: CustomerQuoteView): string {
  const base = `BT Home Designs Quote ${view.number}${view.projectName ? ` - ${view.projectName}` : ""}`;
  return base.replace(/[^A-Za-z0-9 ._-]+/g, "").replace(/\s+/g, " ").trim() + ".pdf";
}

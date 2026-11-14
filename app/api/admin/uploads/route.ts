import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/quotes/auth";
import { errorResponse } from "@/lib/quotes/http";
import { isIdShaped, newId } from "@/lib/quotes/ids";
import { QuoteError } from "@/lib/quotes/service";
import { getStore } from "@/lib/quotes/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// The editor resizes/re-encodes photos to JPEG in the browser before upload,
// keeping each request well under the ~4.5MB serverless body limit.
const MAX_BYTES = 4 * 1024 * 1024;

function sniff(buf: Buffer): "image/jpeg" | "image/png" | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  return null;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const quoteId = String(form.get("quoteId") ?? "");
    const file = form.get("file");
    if (!isIdShaped(quoteId)) throw new QuoteError("Missing quote.");
    if (!(file instanceof File)) throw new QuoteError("No file received.");
    if (file.size > MAX_BYTES) throw new QuoteError("Photo is too large (max 4 MB after resizing).", 413);
    const data = Buffer.from(await file.arrayBuffer());
    const mime = sniff(data); // trust the bytes, not the filename
    if (!mime) throw new QuoteError("Only JPG or PNG photos are supported.");
    const id = newId();
    await (await getStore()).putFile(id, quoteId, { mime, data });
    return NextResponse.json({ id });
  } catch (err) {
    return errorResponse(err);
  }
}

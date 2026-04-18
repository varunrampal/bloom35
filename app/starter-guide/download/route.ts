import { readFile } from "node:fs/promises";
import path from "node:path";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { saveStarterGuideEmail } from "@/lib/starter-guide-email-store";

const starterGuideFilename = "Bloom35_Perimenopause_Starter_Guide.pdf";
const starterGuidePath = path.join(
  process.cwd(),
  "public",
  "guides",
  starterGuideFilename,
);

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const runtime = "nodejs";

const createNoIndexHeaders = (headers: HeadersInit = {}) => ({
  ...headers,
  "X-Robots-Tag": "noindex, nofollow, noarchive",
});

export async function GET(request: NextRequest) {
  const email =
    request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!isValidEmail(email)) {
    return new NextResponse("Enter a valid email address to download the guide.", {
      headers: createNoIndexHeaders(),
      status: 400,
    });
  }

  let pdfBuffer: Awaited<ReturnType<typeof readFile>>;

  try {
    pdfBuffer = await readFile(starterGuidePath);
  } catch {
    return new NextResponse("The starter guide could not be found.", {
      headers: createNoIndexHeaders(),
      status: 404,
    });
  }

  try {
    await saveStarterGuideEmail(email);
  } catch (error) {
    console.error("Starter guide email capture failed:", error);

    return new NextResponse(
      "The starter guide could not be downloaded right now.",
      {
        headers: createNoIndexHeaders(),
        status: 500,
      },
    );
  }

  return new NextResponse(pdfBuffer, {
    headers: createNoIndexHeaders({
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${starterGuideFilename}"`,
      "Content-Length": String(pdfBuffer.byteLength),
      "Content-Type": "application/pdf",
    }),
  });
}

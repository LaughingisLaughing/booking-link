import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { BookResponse } from "@/contracts/types";
import { handleRouteError } from "@/lib/http";
import { bookSlot } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bookRequestSchema = z.object({
  start: z.string().datetime(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  note: z.string().trim().max(1000).optional(),
  timeZone: z.string().trim().min(1).max(80),
});

export async function POST(request: NextRequest) {
  try {
    const payload = bookRequestSchema.parse(await request.json());
    const result = await bookSlot(payload);
    return NextResponse.json<BookResponse>(result);
  } catch (error) {
    return handleRouteError(error);
  }
}


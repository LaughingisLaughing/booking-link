import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { CancelResponse } from "@/contracts/types";
import { handleRouteError } from "@/lib/http";
import { cancelBookingByToken } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cancelRequestSchema = z.object({
  token: z.string().min(10).max(120),
});

export async function POST(request: NextRequest) {
  try {
    const payload = cancelRequestSchema.parse(await request.json());
    const result = await cancelBookingByToken(payload.token);
    return NextResponse.json<CancelResponse>(result);
  } catch (error) {
    return handleRouteError(error);
  }
}


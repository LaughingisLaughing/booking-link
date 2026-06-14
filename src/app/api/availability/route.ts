import { NextRequest, NextResponse } from "next/server";

import type { AvailabilityResponse } from "@/contracts/types";
import { handleRouteError } from "@/lib/http";
import { getAvailability } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const timeZone = request.nextUrl.searchParams.get("timezone");
    const availability = await getAvailability(timeZone);
    const status = availability.connected ? 200 : 503;
    return NextResponse.json<AvailabilityResponse>(availability, { status });
  } catch (error) {
    return handleRouteError(error);
  }
}


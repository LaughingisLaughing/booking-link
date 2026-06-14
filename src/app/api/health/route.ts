import { NextResponse } from "next/server";

import { appConfig, getSetupIssues } from "@/lib/config";
import { getGoogleConnectionStatus } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const google = getGoogleConnectionStatus();
  return NextResponse.json({
    ok: getSetupIssues().length === 0 && google.connected,
    setupIssues: getSetupIssues(),
    google,
    owner: {
      email: appConfig.ownerEmail,
      calendarId: appConfig.googleCalendarId,
      timeZone: appConfig.ownerTimeZone,
    },
  });
}


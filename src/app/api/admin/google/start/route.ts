import { NextRequest, NextResponse } from "next/server";

import { appConfig } from "@/lib/config";
import { getGoogleAuthUrl } from "@/lib/google";
import { handleRouteError, jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get("secret");
    if (!appConfig.adminSecret) {
      return jsonError("setup_incomplete", "ADMIN_SECRET is not configured.", 500);
    }
    if (secret !== appConfig.adminSecret) {
      return jsonError("forbidden", "Invalid admin secret.", 403);
    }
    return NextResponse.redirect(getGoogleAuthUrl());
  } catch (error) {
    return handleRouteError(error);
  }
}


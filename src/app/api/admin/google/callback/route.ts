import { NextRequest, NextResponse } from "next/server";

import { completeGoogleOAuth } from "@/lib/google";
import { handleRouteError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) throw new Error("Missing Google OAuth code.");
    await completeGoogleOAuth(code, request.nextUrl.searchParams.get("state"));
    return NextResponse.redirect(new URL("/admin?connected=1", request.url));
  } catch (error) {
    const response = handleRouteError(error);
    if (response.status >= 500) return response;
    return response;
  }
}


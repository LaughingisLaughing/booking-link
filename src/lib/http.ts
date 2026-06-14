import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiError } from "@/contracts/types";
import { SchedulerError } from "@/lib/scheduler";

export const jsonError = (code: string, message: string, status = 400) => {
  return NextResponse.json<ApiError>({ error: { code, message } }, { status });
};

export const handleRouteError = (error: unknown) => {
  console.error(error);
  if (error instanceof SchedulerError) {
    return jsonError(error.code, error.message, error.status);
  }
  if (error instanceof ZodError) {
    return jsonError("invalid_request", "Check the form fields and try again.", 400);
  }
  if (error instanceof Error) {
    return jsonError("server_error", error.message, 500);
  }
  return jsonError("server_error", "Something went wrong.", 500);
};


import { NextRequest, NextResponse } from "next/server";

// ⚠️ DISABLED: Stripe payment webhook functionality has been removed.
// This endpoint is no longer functional.

export async function POST(req: NextRequest) {
  return new NextResponse("Stripe payment functionality is disabled", {
    status: 404,
  });
}

import { NextResponse } from "next/server";

// ⚠️ DISABLED: Stripe subscription creation functionality has been removed.
// This endpoint is no longer functional.

export async function POST(req: Request) {
  return new NextResponse("Stripe payment functionality is disabled", {
    status: 404,
  });
}

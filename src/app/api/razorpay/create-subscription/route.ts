import { NextRequest, NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { agencyId, planId, planName, amount } = await req.json();

    if (!agencyId || !planId) {
      return NextResponse.json(
        { error: "Missing agencyId or planId" },
        { status: 400 }
      );
    }

    let razorpayPlanId = "";
    if (planName === "BASIC") {
      razorpayPlanId = process.env.RAZORPAY_BASIC_PLAN_ID || "";
    } else if (planName === "UNLIMITED") {
      razorpayPlanId = process.env.RAZORPAY_UNLIMITED_PLAN_ID || "";
    }

    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: `Razorpay Plan ID not configured in .env for plan: ${planName}` },
        { status: 400 }
      );
    }

    // Create a Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12, // 12 billing cycles
      notes: {
        agencyId,
        plan: planName,
      },
    });

    // Upsert the subscription record in our DB (initially inactive until payment confirmed)
    await db.subscription.upsert({
      where: { agencyId },
      create: {
        agencyId,
        plan: planName || "BASIC",
        price: String(amount),
        active: false,
        razorpaySubscriptionId: subscription.id,
      },
      update: {
        plan: planName || "BASIC",
        price: String(amount),
        active: false,
        razorpaySubscriptionId: subscription.id,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    });
  } catch (error: any) {
    console.error("Razorpay subscription creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

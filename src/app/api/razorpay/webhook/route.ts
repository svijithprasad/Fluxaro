import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Razorpay webhook signature mismatch");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`[Razorpay Webhook] Event: ${eventType}`);

    switch (eventType) {
      case "subscription.activated": {
        const subscriptionEntity = event.payload.subscription.entity;
        const agencyId = subscriptionEntity.notes?.agencyId;

        if (agencyId) {
          await db.subscription.upsert({
            where: { agencyId },
            create: {
              agencyId,
              plan: subscriptionEntity.notes?.plan || "BASIC",
              price: String(subscriptionEntity.plan_id),
              active: true,
              razorpaySubscriptionId: subscriptionEntity.id,
              razorpayCustomerId: subscriptionEntity.customer_id || null,
              currentPeriodEndDate: subscriptionEntity.current_end
                ? new Date(subscriptionEntity.current_end * 1000)
                : null,
            },
            update: {
              plan: subscriptionEntity.notes?.plan || "BASIC",
              active: true,
              razorpaySubscriptionId: subscriptionEntity.id,
              razorpayCustomerId: subscriptionEntity.customer_id || null,
              currentPeriodEndDate: subscriptionEntity.current_end
                ? new Date(subscriptionEntity.current_end * 1000)
                : null,
            },
          });
          console.log(`[Razorpay] Subscription activated for agency: ${agencyId}`);
        }
        break;
      }

      case "subscription.charged": {
        const subscriptionEntity = event.payload.subscription.entity;
        const agencyId = subscriptionEntity.notes?.agencyId;

        if (agencyId) {
          await db.subscription.update({
            where: { agencyId },
            data: {
              active: true,
              currentPeriodEndDate: subscriptionEntity.current_end
                ? new Date(subscriptionEntity.current_end * 1000)
                : null,
            },
          });
          console.log(`[Razorpay] Subscription charged for agency: ${agencyId}`);
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed":
      case "subscription.expired": {
        const subscriptionEntity = event.payload.subscription.entity;
        const agencyId = subscriptionEntity.notes?.agencyId;

        if (agencyId) {
          await db.subscription.update({
            where: { agencyId },
            data: {
              active: false,
              plan: "FREE",
            },
          });
          console.log(`[Razorpay] Subscription ended for agency: ${agencyId}`);
        }
        break;
      }

      case "subscription.paused": {
        const subscriptionEntity = event.payload.subscription.entity;
        const agencyId = subscriptionEntity.notes?.agencyId;

        if (agencyId) {
          await db.subscription.update({
            where: { agencyId },
            data: {
              active: false,
            },
          });
          console.log(`[Razorpay] Subscription paused for agency: ${agencyId}`);
        }
        break;
      }

      default:
        console.log(`[Razorpay] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

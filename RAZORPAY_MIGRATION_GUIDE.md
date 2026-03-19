# Razorpay Integration Guide for Plura (India)

## 📋 Setup Steps

### 1. Install Razorpay SDK
```bash
npm install razorpay axios
```

### 2. Get Razorpay Credentials
- Sign up at: https://razorpay.com
- Go to Settings → API Keys
- Copy: `Key ID` and `Key Secret`
- Add to `.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### 3. Razorpay vs Stripe - Key Differences

| Feature | Stripe | Razorpay |
|---------|--------|----------|
| **API Style** | RESTful | RESTful |
| **Connect Accounts** | Yes (Stripe Connect) | No (Direct integration) |
| **Products/Prices** | Custom schema | Simpler - plans direct |
| **Subscriptions** | Via Subscriptions API | Via Subscription Plans |
| **Metrics Tracking** | Sessions + Balance | Orders + Payments |
| **Webhook Events** | Detailed events | order.paid, subscription.completed |
| **Dashboard** | Separate Stripe dashboard | Razorpay dashboard |

### 4. Dashboard Metrics - Data Source Changes

**OLD (Stripe):**
- Used `stripe.checkout.sessions.list()` for payment data
- Connected via `connectAccountId`
- Data: session status, amount, created date

**NEW (Razorpay):**
- Use Razorpay Payments API or Orders API
- Direct integration (no agent accounts)
- Data: payment status, amount, created timestamp
- Track via database records + Razorpay API

---

## 🔧 Implementation Steps

### Step 1: Create Razorpay Service (`src/lib/razorpay/index.ts`)

```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default razorpay;
```

### Step 2: Update Database Schema (`prisma/schema.prisma`)

Add to `Agency` model:
```prisma
model Agency {
  // ... existing fields
  razorpayAccountId    String?               // Store Razorpay account/merchant ID
  subscriptionPlanId   String?               // For subscriptions
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt

  // Add relation for payment tracking
  Payments             Payment[]
}

model Payment {
  id                   String      @id @default(uuid())
  razorpayPaymentId    String      @unique
  razorpayOrderId      String?
  agencyId            String
  agency              Agency      @relation(fields: [agencyId], references: [id], onDelete: Cascade)

  amount              Int         // Amount in paise (e.g., 50000 = ₹500)
  status              String      // "created", "authorized", "captured", "failed"
  method              String      // "card", "netbanking", "upi", "wallet"
  currency            String      @default("INR")

  description         String?
  notes               String?     @db.Text // JSON string

  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  @@index([agencyId])
  @@index([razorpayPaymentId])
}
```

### Step 3: Dashboard - Fetch Razorpay Metrics

**File: `src/app/(main)/agency/[agencyId]/page.tsx`**

Replace the Stripe section with:

```typescript
import { db } from "@/lib/db";
import razorpay from "@/lib/razorpay";

const Page = async ({ params }: { params: { agencyId: string } }) => {
  let currency = "INR";
  let sessions = [];
  let totalClosedSessions = [];
  let totalPendingSessions = [];
  let net = 0;
  let potentialIncome = 0;
  let closingRate = 0;

  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000;
  const endDate = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000;

  const agencyDetails = await db.agency.findUnique({
    where: { id: params.agencyId },
  });

  if (!agencyDetails) return;

  const subaccounts = await db.subAccount.findMany({
    where: { agencyId: params.agencyId },
  });

  // Fetch payments from database (synced from Razorpay)
  try {
    const payments = await db.payment.findMany({
      where: {
        agencyId: params.agencyId,
        createdAt: {
          gte: new Date(startDate * 1000),
          lte: new Date(endDate * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sessions = payments;

    totalClosedSessions = payments
      .filter((p) => p.status === "captured")
      .map((p) => ({
        id: p.id,
        created: new Date(p.createdAt).toLocaleDateString(),
        amount_total: p.amount / 100, // Convert paise to rupees
        status: p.status,
        method: p.method,
      }));

    totalPendingSessions = payments
      .filter((p) => p.status === "authorized" || p.status === "created")
      .map((p) => ({
        id: p.id,
        created: new Date(p.createdAt).toLocaleDateString(),
        amount_total: p.amount / 100,
        status: p.status,
      }));

    net = +totalClosedSessions
      .reduce((total, session) => total + (session.amount_total || 0), 0)
      .toFixed(2);

    potentialIncome = +totalPendingSessions
      .reduce((total, session) => total + (session.amount_total || 0), 0)
      .toFixed(2);

    closingRate = +(
      (totalClosedSessions.length / (sessions.length || 1)) * 100
    ).toFixed(2);
  } catch (error) {
    console.error("Error fetching Razorpay data:", error);
  }

  return (
    <div className="relative h-full">
      <h1 className="text-4xl">Dashboard</h1>
      {/* Rest of dashboard JSX remains the same */}
    </div>
  );
};

export default Page;
```

### Step 4: Create Razorpay Order API Route

**File: `src/app/api/razorpay/create-order/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { agencyId, amount, customerEmail } = await req.json();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        agencyId,
        customerEmail,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Payment Verification API

**File: `src/app/api/razorpay/verify-payment/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      agencyId,
    } = await req.json();

    // Verify signature
    const sha = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (sha !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Save payment to database
    const payment = await db.payment.upsert({
      where: { razorpayPaymentId: razorpay_payment_id },
      create: {
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        agencyId,
        amount: 0, // Fetch from Razorpay if needed
        status: "captured",
        method: "card",
        currency: "INR",
      },
      update: {
        status: "captured",
      },
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
```

### Step 6: Webhook for Razorpay Events

**File: `src/app/api/razorpay/webhook/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature")!;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "payment.authorized":
        await db.payment.upsert({
          where: { razorpayPaymentId: event.payload.payment.entity.id },
          create: {
            razorpayPaymentId: event.payload.payment.entity.id,
            razorpayOrderId: event.payload.payment.entity.order_id,
            agencyId: event.payload.payment.entity.notes.agencyId,
            amount: event.payload.payment.entity.amount,
            status: "authorized",
            method: event.payload.payment.entity.method,
            currency: "INR",
          },
          update: { status: "authorized" },
        });
        break;

      case "payment.failed":
        await db.payment.upsert({
          where: { razorpayPaymentId: event.payload.payment.entity.id },
          create: {
            razorpayPaymentId: event.payload.payment.entity.id,
            razorpayOrderId: event.payload.payment.entity.order_id || null,
            agencyId: event.payload.payment.entity.notes?.agencyId,
            amount: event.payload.payment.entity.amount,
            status: "failed",
            method: event.payload.payment.entity.method,
            currency: "INR",
          },
          update: { status: "failed" },
        });
        break;

      case "subscription.completed":
        // Handle subscription completion
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
```

### Step 7: Frontend Payment Form

```typescript
"use client";

import { useEffect, useState } from "react";

const RazorpayForm = ({ agencyId, email }: { agencyId: string; email: string }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId,
          amount: 500, // ₹500
          customerEmail: email,
        }),
      });

      const { orderId } = await orderRes.json();

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 50000, // Amount in paise
        currency: "INR",
        name: "Plura",
        description: "Premium Subscription",
        order_id: orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              agencyId,
            }),
          });

          if (verifyRes.ok) {
            alert("Payment successful!");
          }
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  return (
    <button onClick={handlePayment} disabled={isProcessing}>
      {isProcessing ? "Processing..." : "Pay with Razorpay"}
    </button>
  );
};

export default RazorpayForm;
```

---

## 📊 Dashboard Update Flow (Razorpay)

```
┌─────────────────────────────────────────────────────────┐
│ User visits: /agency/[agencyId]/page.tsx               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Server fetches data  │
        └──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                           │
        ▼                           ▼
   Database              Razorpay API (optional)
   (Payment records)     (For real-time sync)
        │                           │
        ├──────────────┬────────────┤
        │              │            │
        ▼              ▼            ▼
   Completed       Pending      Failed
   Payments        Payments     Payments
        │              │            │
        └──────────────┴────────────┘
                   │
                   ▼
        Calculate Metrics:
        - Net Income
        - Potential Income
        - Closing Rate
                   │
                   ▼
        Render Dashboard with
        Updated Values
```

---

## 🔄 Migration Checklist

- [ ] Install Razorpay SDK
- [ ] Get Razorpay credentials and add to `.env.local`
- [ ] Update Prisma schema with Payment model
- [ ] Run `prisma migrate dev`
- [ ] Create Razorpay service (`src/lib/razorpay/index.ts`)
- [ ] Create API routes (order, verify, webhook)
- [ ] Update dashboard page to fetch from database
- [ ] Add Razorpay form component
- [ ] Set up webhook in Razorpay dashboard
- [ ] Test payment flow locally
- [ ] Deploy to production

---

## 🧪 Testing Razorpay Locally

Use these test credentials:
- **Card**: 4111 1111 1111 1111
- **Expiry**: 12/25
- **CVV**: 123
- **OTP**: 123456

---

## 📞 Razorpay Support

- Docs: https://razorpay.com/docs
- API Reference: https://razorpay.com/docs/api
- Support: support@razorpay.com

# Custom CSS, Razorpay Subscriptions & Tier Restrictions

## Feature 1: Custom CSS & Image Resize

### [MODIFY] [settings-tab.tsx](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/app/(main)/subaccount/[subaccountId]/funnels/[funnelId]/editor/[funnelPageId]/_components/funnel-editor-sidebar/tabs/settings-tab.tsx)
- Add a **"Custom CSS"** accordion section with a `<textarea>` that accepts raw CSS (e.g. `border: 2px solid red; box-shadow: 0 0 10px black`).
- Parse CSS string into an object and merge it with the element's styles (**overriding** existing styles).
- Store as `customCss` string on the element's content.

### [MODIFY] [editor-provider.tsx](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/providers/editor/editor-provider.tsx)
- Add `customCss?: string` to the `EditorElement.content` type.

### [MODIFY] All editor component renderers
- Apply parsed `customCss` styles last (after all other styles) so they override.

### Image Resize
- Already has width/height in the **Dimensions** section of [settings-tab.tsx](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/app/%28main%29/subaccount/%5BsubaccountId%5D/funnels/%5BfunnelId%5D/editor/%5BfunnelPageId%5D/_components/funnel-editor-sidebar/tabs/settings-tab.tsx).
- Will add specific visual width/height inputs in the **Custom** section when `type === "image"`.

---

## Feature 2: Razorpay Subscription Integration

### [MODIFY] [schema.prisma](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/prisma/schema.prisma)
- Uncomment and update the [Subscription](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/app/%28main%29/agency/%5BagencyId%5D/billing/_components/subscription-helper.tsx#10-16) model for Razorpay:
  ```prisma
  model Subscription {
    id                   String   @id @default(uuid())
    createdAt            DateTime @default(now())
    updatedAt            DateTime @updatedAt
    plan                 String   @default("FREE")    // "FREE" | "BASIC" | "UNLIMITED"
    price                String?
    active               Boolean  @default(true)
    razorpaySubscriptionId String? @unique
    razorpayCustomerId   String?
    currentPeriodEndDate DateTime?
    agencyId             String?  @unique
    Agency               Agency?  @relation(fields: [agencyId], references: [id])
  }
  ```
- Add `Subscription Subscription?` relation to the [Agency](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/lib/queries.ts#269-273) model.
- Remove old `Plan` enum (or keep for migration).

### Tier Limits

| Feature | FREE | BASIC (₹499/mo) | UNLIMITED (₹1999/mo) |
|---------|------|------------------|----------------------|
| Sub Accounts | 3 | 10 | Unlimited |
| Funnels per Sub Account | 3 | 20 | Unlimited |
| Pipelines per Sub Account | 2 | 10 | Unlimited |
| Team Members | 2 | 5 | Unlimited |
| Media Uploads | 50 | 500 | Unlimited |

### [NEW] `src/lib/subscription.ts`
- Helper functions: `getSubscription(agencyId)`, `checkLimit(agencyId, resource)`, `TIER_LIMITS` constant.

### [NEW] `src/app/api/razorpay/create-subscription/route.ts`
- Creates a Razorpay subscription using the Razorpay SDK.

### [NEW] `src/app/api/razorpay/webhook/route.ts`
- Handles `subscription.activated`, `subscription.charged`, `subscription.cancelled` events.
- Updates [Subscription](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/app/%28main%29/agency/%5BagencyId%5D/billing/_components/subscription-helper.tsx#10-16) record in DB.

### [MODIFY] [billing/page.tsx](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/app/(main)/agency/[agencyId]/billing/page.tsx)
- Replace disabled alert with a subscription management UI showing current plan, upgrade/downgrade buttons, and Razorpay checkout.

### [NEW] `src/components/subscription/pricing-cards.tsx`
- Renders pricing tiers with "Subscribe" buttons.

---

## Feature 3: Tier-Based Enforcement

### [MODIFY] Key server actions in [queries.ts](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/lib/queries.ts)
- [upsertSubAccount](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/lib/queries.ts#427-507): Check subaccount limit before creation.
- [upsertFunnel](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/lib/queries.ts#725-742): Check funnel limit per subaccount.
- [upsertPipeline](file:///c:/MAJORPROJECT/me-plura%20-%20Copy/src/lib/queries.ts#743-754) (if exists, or in pipeline creation): Check pipeline limit.

### [NEW] `src/components/global/upgrade-prompt.tsx`
- A modal that shows when a limit is reached, prompting the user to upgrade.

---

## Verification Plan
- `npx prisma db push` to apply schema changes.
- `npx tsc --noEmit` for type checking.
- Manual: test subscription checkout with Razorpay test keys.
- Manual: verify free tier limits block creation beyond the cap.

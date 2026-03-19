"use server";

// ⚠️ DEPRECATED: Stripe actions have been disabled
// All payment-related functionality has been removed from the application

export const subscriptionCreated = async (
  subscription: any,
  customerId: string
) => {
  // DISABLED: Subscription creation is no longer functional
  console.log("⚠️ Subscription creation is disabled");
};

export const getConnectAccountProducts = async (stripeAccount: string) => {
  // DISABLED: Product fetching from Stripe is no longer functional
  console.log("⚠️ Stripe product fetching is disabled");
  return [];
};

/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");

process.env.STRIPE_STARTER_PRICE_ID = "price_starter";
process.env.STRIPE_PRO_PRICE_ID = "price_pro";
process.env.STRIPE_AGENCY_PRICE_ID = "price_agency";
process.env.STRIPE_PACK_50_PRICE_ID = "price_pack_50";
process.env.STRIPE_PACK_200_PRICE_ID = "price_pack_200";
process.env.STRIPE_PACK_500_PRICE_ID = "price_pack_500";

const {
  CHECKOUT_SESSION_TTL_SECONDS,
  buildCheckoutSessionParams,
  checkoutExpiresAt,
  resolveCheckoutProduct,
} = require("../.test-dist/stripe.js");

const sessionInput = {
  userId: "user_123",
  email: "member@example.com",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  expiresAt: 1_700_002_100,
};

test("expires incomplete checkout sessions after thirty-five minutes", () => {
  assert.equal(CHECKOUT_SESSION_TTL_SECONDS, 2100);
  assert.equal(checkoutExpiresAt(1_700_000_000), 1_700_002_100);
});

test("wires bounded expiry into subscription checkout parameters", () => {
  const params = buildCheckoutSessionParams({
    ...sessionInput,
    product: { type: "subscription", priceId: "price_pro", tier: "pro" },
  });
  assert.equal(params.mode, "subscription");
  assert.equal(params.expires_at, sessionInput.expiresAt);
  assert.equal(params.subscription_data.metadata.user_id, sessionInput.userId);
});

test("wires bounded expiry into credit checkout parameters", () => {
  const params = buildCheckoutSessionParams({
    ...sessionInput,
    product: { type: "credits", priceId: "price_pack_50", credits: 50 },
  });
  assert.equal(params.mode, "payment");
  assert.equal(params.expires_at, sessionInput.expiresAt);
  assert.equal(params.metadata.credits, "50");
});

test("derives credit quantity from the configured server pack", () => {
  assert.deepEqual(resolveCheckoutProduct("price_pack_50", "credits"), {
    type: "credits",
    priceId: "price_pack_50",
    credits: 50,
  });
});

test("rejects an unknown price instead of trusting client entitlements", () => {
  assert.equal(resolveCheckoutProduct("price_attacker_controlled", "credits"), null);
});

test("rejects a valid price used with the wrong checkout type", () => {
  assert.equal(resolveCheckoutProduct("price_starter", "credits"), null);
  assert.equal(resolveCheckoutProduct("price_pack_500", "subscription"), null);
});

test("resolves configured subscription prices to their server tier", () => {
  assert.deepEqual(resolveCheckoutProduct("price_pro", "subscription"), {
    type: "subscription",
    priceId: "price_pro",
    tier: "pro",
  });
});

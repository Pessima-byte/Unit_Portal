import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!stripeInstance) {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey && stripeKey !== "your-stripe-secret-key") {
      stripeInstance = new Stripe(stripeKey, {
        apiVersion: "2025-11-17.clover",
      })
    }
  }
  return stripeInstance
}

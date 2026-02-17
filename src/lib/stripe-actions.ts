"use server"

import { getStripe } from "./stripe"

export async function createPaymentIntent(amount: number, metadata: Record<string, string>) {
  const stripe = getStripe()
  
  if (!stripe) {
    // Demo mode - return mock payment intent
    return {
      success: true,
      clientSecret: null,
      paymentIntentId: `pi_demo_${Date.now()}`,
      demo: true,
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      demo: false,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return {
      success: false,
      error: "Failed to create payment intent",
    }
  }
}

export async function confirmPayment(paymentIntentId: string) {
  const stripe = getStripe()
  
  if (!stripe) {
    // Demo mode - simulate successful payment
    return {
      success: true,
      demo: true,
    }
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status === "succeeded") {
      return {
        success: true,
        demo: false,
      }
    }

    return {
      success: false,
      error: "Payment not completed",
    }
  } catch (error) {
    console.error("Error confirming payment:", error)
    return {
      success: false,
      error: "Failed to confirm payment",
    }
  }
}




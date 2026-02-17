"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createPaymentIntent, confirmPayment } from "@/lib/stripe-actions"

export async function makePayment(feeStructureId: string, amount: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return { success: false, error: "Unauthorized" }
    }

    const feeStructure = await db.feeStructure.findUnique({
      where: { id: feeStructureId },
    })

    if (!feeStructure || !feeStructure.isActive) {
      return { success: false, error: "Fee structure not found" }
    }

    if (amount > feeStructure.amount) {
      return { success: false, error: "Amount exceeds fee structure amount" }
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, {
      studentId: session.user.id,
      feeStructureId,
    })

    if (!paymentIntent.success) {
      return { success: false, error: paymentIntent.error || "Failed to create payment" }
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        studentId: session.user.id,
        feeStructureId,
        amount,
        status: paymentIntent.demo ? "COMPLETED" : "PENDING",
        paymentMethod: "ONLINE",
        transactionId: paymentIntent.paymentIntentId,
        paidAt: paymentIntent.demo ? new Date() : null,
      },
    })

    // If demo mode, payment is already completed
    if (paymentIntent.demo) {
      revalidatePath("/student/payments")
      return {
        success: true,
        paymentId: payment.id,
        demo: true,
        message: "Payment processed (Demo Mode)",
      }
    }

    revalidatePath("/student/payments")
    return {
      success: true,
      paymentId: payment.id,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      demo: false,
    }
  } catch (error) {
    console.error("Error making payment:", error)
    return { success: false, error: "Failed to process payment" }
  }
}

export async function confirmPaymentStatus(paymentIntentId: string, paymentId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const result = await confirmPayment(paymentIntentId)

    if (result.success) {
      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      })

      revalidatePath("/student/payments")
      return { success: true }
    }

    return { success: false, error: result.error || "Payment not confirmed" }
  } catch (error) {
    console.error("Error confirming payment:", error)
    return { success: false, error: "Failed to confirm payment" }
  }
}



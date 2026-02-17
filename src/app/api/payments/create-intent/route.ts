import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPaymentIntent } from "@/lib/stripe-actions"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, feeStructureId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    const result = await createPaymentIntent(amount, {
      studentId: session.user.id,
      feeStructureId: feeStructureId || "",
    })

    if (result.success) {
      return NextResponse.json({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        demo: result.demo,
      })
    }

    return NextResponse.json(
      { error: result.error || "Failed to create payment" },
      { status: 500 }
    )
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


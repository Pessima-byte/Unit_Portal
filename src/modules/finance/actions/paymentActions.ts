"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updatePaymentStatus(paymentId: string, status: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FINANCE") {
      return { success: false, error: "Unauthorized" }
    }

    await db.payment.update({
      where: { id: paymentId },
      data: {
        status: status as any,
        paidAt: status === "COMPLETED" ? new Date() : null,
      },
    })

    revalidatePath("/finance/payments")
    return { success: true }
  } catch (error) {
    console.error("Error updating payment status:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}





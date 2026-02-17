"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function approveGrade(gradeId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await db.grade.update({
      where: { id: gradeId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
    })

    revalidatePath("/admin/results")
    return { success: true }
  } catch (error) {
    console.error("Error approving grade:", error)
    return { success: false, error: "Failed to approve grade" }
  }
}

export async function rejectGrade(gradeId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await db.grade.update({
      where: { id: gradeId },
      data: {
        status: "REJECTED",
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
    })

    revalidatePath("/admin/results")
    return { success: true }
  } catch (error) {
    console.error("Error rejecting grade:", error)
    return { success: false, error: "Failed to reject grade" }
  }
}





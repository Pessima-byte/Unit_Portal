"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface FeeStructureData {
  name: string
  description: string | null
  amount: number
  academicYear: string
  semester: string | null
  level: number | null
  dueDate: Date | null
  departmentId: string | null
}

interface UpdateFeeStructureData extends FeeStructureData {
  isActive: boolean
}

export async function createFeeStructure(data: FeeStructureData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FINANCE") {
      return { success: false, error: "Unauthorized" }
    }

    await db.feeStructure.create({
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        academicYear: data.academicYear,
        semester: data.semester,
        level: data.level,
        dueDate: data.dueDate,
        departmentId: data.departmentId,
      },
    })

    revalidatePath("/finance/fees")
    return { success: true }
  } catch (error) {
    console.error("Error creating fee structure:", error)
    return { success: false, error: "Failed to create fee structure" }
  }
}

export async function updateFeeStructure(feeId: string, data: UpdateFeeStructureData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FINANCE") {
      return { success: false, error: "Unauthorized" }
    }

    await db.feeStructure.update({
      where: { id: feeId },
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        academicYear: data.academicYear,
        semester: data.semester,
        level: data.level,
        dueDate: data.dueDate,
        departmentId: data.departmentId,
        isActive: data.isActive,
      },
    })

    revalidatePath("/finance/fees")
    return { success: true }
  } catch (error) {
    console.error("Error updating fee structure:", error)
    return { success: false, error: "Failed to update fee structure" }
  }
}

export async function deleteFeeStructure(feeId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FINANCE") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if fee structure has payments
    const payments = await db.payment.count({
      where: { feeStructureId: feeId },
    })

    if (payments > 0) {
      return {
        success: false,
        error: "Cannot delete fee structure with existing payments",
      }
    }

    await db.feeStructure.delete({
      where: { id: feeId },
    })

    revalidatePath("/finance/fees")
    return { success: true }
  } catch (error) {
    console.error("Error deleting fee structure:", error)
    return { success: false, error: "Failed to delete fee structure" }
  }
}





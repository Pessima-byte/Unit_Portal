"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addPrerequisite(courseId: string, prerequisiteId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if prerequisite already exists
    const existing = await db.coursePrerequisite.findFirst({
      where: {
        requiredCourseId: courseId,
        prerequisiteId: prerequisiteId,
      },
    })

    if (existing) {
      return { success: false, error: "Prerequisite already exists" }
    }

    // Prevent circular dependencies
    if (courseId === prerequisiteId) {
      return { success: false, error: "Course cannot be a prerequisite of itself" }
    }

    await db.coursePrerequisite.create({
      data: {
        requiredCourseId: courseId,
        prerequisiteId: prerequisiteId,
      },
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    console.error("Error adding prerequisite:", error)
    return { success: false, error: "Failed to add prerequisite" }
  }
}

export async function removePrerequisite(courseId: string, prerequisiteId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await db.coursePrerequisite.deleteMany({
      where: {
        requiredCourseId: courseId,
        prerequisiteId: prerequisiteId,
      },
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    console.error("Error removing prerequisite:", error)
    return { success: false, error: "Failed to remove prerequisite" }
  }
}





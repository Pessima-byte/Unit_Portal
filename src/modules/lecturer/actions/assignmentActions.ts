"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface CreateAssignmentData {
  courseId: string
  title: string
  description?: string
  dueDate: Date
  maxScore: number
}

export async function createAssignment(data: CreateAssignmentData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "LECTURER") {
      return { success: false, error: "Unauthorized" }
    }

    // Verify lecturer owns the course
    const course = await db.course.findUnique({
      where: { id: data.courseId },
    })

    if (!course || course.lecturerId !== session.user.id) {
      return { success: false, error: "Course not found or unauthorized" }
    }

    await db.assignment.create({
      data: {
        courseId: data.courseId,
        lecturerId: session.user.id,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate,
        maxScore: data.maxScore,
      },
    })

    revalidatePath("/lecturer/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Failed to create assignment" }
  }
}





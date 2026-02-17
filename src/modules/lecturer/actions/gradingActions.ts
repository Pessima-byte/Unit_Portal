"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface SubmitGradeData {
  studentId: string
  courseId: string
  assignmentId?: string
  score: number
  maxScore: number
  percentage: number
  letterGrade: string
  remarks: string | null
}

export async function submitGrade(data: SubmitGradeData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "LECTURER") {
      return { success: false, error: "Unauthorized" }
    }

    // Verify lecturer has access to the course
    const course = await db.course.findUnique({
      where: { id: data.courseId },
    })

    if (!course || course.lecturerId !== session.user.id) {
      return { success: false, error: "Course not found or unauthorized" }
    }

    // Check if grade already exists
    const existingGrade = await db.grade.findFirst({
      where: {
        studentId: data.studentId,
        courseId: data.courseId,
        assignmentId: data.assignmentId || null,
      },
    })

    if (existingGrade) {
      // Update existing grade
      await db.grade.update({
        where: { id: existingGrade.id },
        data: {
          score: data.score,
          maxScore: data.maxScore,
          percentage: data.percentage,
          letterGrade: data.letterGrade,
          remarks: data.remarks,
          gradedAt: new Date(),
          gradedById: session.user.id,
          status: "PENDING", // Requires admin approval
        },
      })
    } else {
      // Create new grade
      await db.grade.create({
        data: {
          studentId: data.studentId,
          courseId: data.courseId,
          assignmentId: data.assignmentId || null,
          score: data.score,
          maxScore: data.maxScore,
          percentage: data.percentage,
          letterGrade: data.letterGrade,
          remarks: data.remarks,
          gradedAt: new Date(),
          gradedById: session.user.id,
          status: "PENDING",
        },
      })
    }

    revalidatePath("/lecturer/grading")
    return { success: true }
  } catch (error) {
    console.error("Error submitting grade:", error)
    return { success: false, error: "Failed to submit grade" }
  }
}





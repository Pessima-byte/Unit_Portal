"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function registerCourse(courseId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return { success: false, error: "Unauthorized" }
    }

    const studentId = session.user.id

    // Check if already enrolled
    const existingEnrollment = await db.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return { success: false, error: "Already enrolled in this course" }
    }

    // Check course capacity
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course || !course.isActive) {
      return { success: false, error: "Course not available" }
    }

    if (course.maxStudents && course.currentStudents >= course.maxStudents) {
      return { success: false, error: "Course is full" }
    }

    // Check prerequisites
    const prerequisites = await db.coursePrerequisite.findMany({
      where: { requiredCourseId: courseId },
      include: { prerequisite: true },
    })

    if (prerequisites.length > 0) {
      const completedCourses = await db.courseEnrollment.findMany({
        where: {
          studentId,
          courseId: { in: prerequisites.map((p) => p.prerequisiteId) },
          status: { in: ["COMPLETED", "ACTIVE"] },
        },
      })

      const completedCourseIds = completedCourses.map((c) => c.courseId)
      const missingPrerequisites = prerequisites.filter(
        (p) => !completedCourseIds.includes(p.prerequisiteId)
      )

      if (missingPrerequisites.length > 0) {
        return {
          success: false,
          error: `Missing prerequisites: ${missingPrerequisites
            .map((p) => p.prerequisite.code)
            .join(", ")}`,
        }
      }
    }

    // Create enrollment
    await db.courseEnrollment.create({
      data: {
        studentId,
        courseId,
        status: "ACTIVE",
      },
    })

    // Update course student count
    await db.course.update({
      where: { id: courseId },
      data: {
        currentStudents: {
          increment: 1,
        },
      },
    })

    revalidatePath("/student/courses")
    return { success: true }
  } catch (error) {
    console.error("Error registering course:", error)
    return { success: false, error: "Failed to register for course" }
  }
}

export async function unenrollCourse(enrollmentId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return { success: false, error: "Unauthorized" }
    }

    const enrollment = await db.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    })

    if (!enrollment || enrollment.studentId !== session.user.id) {
      return { success: false, error: "Enrollment not found" }
    }

    // Delete enrollment
    await db.courseEnrollment.delete({
      where: { id: enrollmentId },
    })

    // Update course student count
    await db.course.update({
      where: { id: enrollment.courseId },
      data: {
        currentStudents: {
          decrement: 1,
        },
      },
    })

    revalidatePath("/student/courses")
    return { success: true }
  } catch (error) {
    console.error("Error unenrolling from course:", error)
    return { success: false, error: "Failed to unenroll from course" }
  }
}





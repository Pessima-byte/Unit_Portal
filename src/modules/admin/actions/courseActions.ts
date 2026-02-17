"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { CourseLevel } from "@prisma/client"

interface CreateCourseData {
  code: string
  name: string
  description: string | null
  creditUnits: number
  level: number
  type: CourseLevel
  requirements: string[]
  semester: string
  academicYear: string
  maxStudents: number | null
  departmentId: string
  lecturerId: string | null
}

interface UpdateCourseData extends CreateCourseData {
  isActive: boolean
}

export async function createCourse(data: CreateCourseData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if course code already exists
    const existingCourse = await db.course.findUnique({
      where: { code: data.code },
    })

    if (existingCourse) {
      return { success: false, error: "Course code already exists" }
    }

    await db.course.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        creditUnits: data.creditUnits,
        level: data.level,
        type: data.type,
        requirements: data.requirements,
        semester: data.semester,
        academicYear: data.academicYear,
        maxStudents: data.maxStudents,
        departmentId: data.departmentId,
        lecturerId: data.lecturerId,
      },
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    console.error("Error creating course:", error)
    return { success: false, error: "Failed to create course" }
  }
}

export async function updateCourse(courseId: string, data: UpdateCourseData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if course code already exists (for other courses)
    const existingCourse = await db.course.findUnique({
      where: { code: data.code },
    })

    if (existingCourse && existingCourse.id !== courseId) {
      return { success: false, error: "Course code already exists" }
    }

    await db.course.update({
      where: { id: courseId },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        creditUnits: data.creditUnits,
        level: data.level,
        type: data.type,
        requirements: data.requirements,
        semester: data.semester,
        academicYear: data.academicYear,
        maxStudents: data.maxStudents,
        departmentId: data.departmentId,
        lecturerId: data.lecturerId,
        isActive: data.isActive,
      },
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    console.error("Error updating course:", error)
    return { success: false, error: "Failed to update course" }
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if course has active enrollments
    const enrollments = await db.courseEnrollment.count({
      where: {
        courseId,
        status: "ACTIVE",
      },
    })

    if (enrollments > 0) {
      return {
        success: false,
        error: "Cannot delete course with active enrollments",
      }
    }

    await db.course.delete({
      where: { id: courseId },
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    console.error("Error deleting course:", error)
    return { success: false, error: "Failed to delete course" }
  }
}





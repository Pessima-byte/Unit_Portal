"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface AttendanceRecord {
  studentId: string
  status: string
}

interface MarkAttendanceData {
  courseId: string
  date: Date
  records: AttendanceRecord[]
}

export async function markAttendance(data: MarkAttendanceData) {
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

    // Create attendance records
    await Promise.all(
      data.records.map((record) =>
        db.attendance.create({
          data: {
            studentId: record.studentId,
            courseId: data.courseId,
            date: data.date,
            status: record.status,
          },
        })
      )
    )

    revalidatePath("/lecturer/attendance")
    return { success: true }
  } catch (error) {
    console.error("Error marking attendance:", error)
    return { success: false, error: "Failed to mark attendance" }
  }
}





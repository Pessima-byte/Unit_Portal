"use server"

import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getPendingApplications() {
    try {
        const applications = await db.user.findMany({
            where: {
                role: "APPLICANT",
                isActive: false,
            },
            include: {
                appliedCourse: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return { success: true, applications }
    } catch (error) {
        console.error("Error fetching applications:", error)
        return { success: false, error: "Failed to fetch applications" }
    }
}

export async function approveApplication(userId: string) {
    try {
        const applicant = await db.user.findUnique({
            where: { id: userId },
            include: { appliedCourse: true },
        })

        if (!applicant) {
            return { success: false, error: "Applicant not found" }
        }

        if (applicant.role !== "APPLICANT") {
            return { success: false, error: "User is not an applicant" }
        }

        // Generate Student ID: STU + Year + 4 random digits
        // In a real app, this should be more robust (check collision, proper sequence)
        const year = new Date().getFullYear()
        const random = Math.floor(1000 + Math.random() * 9000)
        const studentId = `STU-${year}-${random}`

        // Start transaction to update user and enroll
        await db.$transaction(async (tx) => {
            // Update User
            await tx.user.update({
                where: { id: userId },
                data: {
                    role: "STUDENT",
                    isActive: true,
                    studentId: studentId,
                },
            })

            // Enroll in Course if applied
            if (applicant.appliedCourseId) {
                await tx.courseEnrollment.create({
                    data: {
                        studentId: userId,
                        courseId: applicant.appliedCourseId,
                        status: "ACTIVE",
                    },
                })

                // Update course student count
                await tx.course.update({
                    where: { id: applicant.appliedCourseId },
                    data: {
                        currentStudents: { increment: 1 }
                    }
                })
            }
        })

        revalidatePath("/admin/applications")
        return { success: true }
    } catch (error) {
        console.error("Error approving application:", error)
        return { success: false, error: "Failed to approve application" }
    }
}

export async function rejectApplication(userId: string) {
    try {
        // For now, we delete the applicant so they can re-apply or we just remove the record
        await db.user.delete({
            where: { id: userId },
        })

        revalidatePath("/admin/applications")
        return { success: true }
    } catch (error) {
        console.error("Error rejecting application:", error)
        return { success: false, error: "Failed to reject application" }
    }
}

"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "STUDENT" | "LECTURER"
  studentId?: string // This might be empty for applicants
  phone?: string
  courseId?: string
}

export async function getColleges() {
  try {
    const colleges = await db.college.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    })
    return { success: true, colleges }
  } catch (error) {
    console.error("Error fetching colleges:", error)
    return { success: false, error: "Failed to fetch colleges" }
  }
}

export async function getRegistrationCourses(collegeId?: string) {
  try {
    const where: any = { isActive: true }

    if (collegeId) {
      where.department = {
        collegeId: collegeId
      }
    }

    const courses = await db.course.findMany({
      where,
      select: { id: true, name: true, code: true },
      take: 100
    })
    return { success: true, courses }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { success: false, error: "Failed to fetch courses" }
  }
}

export interface StudentApplicationData {
  // User Account
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  dateOfBirth: Date
  address: string

  // Personal
  gender: string
  nationality: string
  religion?: string
  placeOfBirth?: string

  // Guardian
  guardianName: string
  guardianRelationship: string
  guardianPhone: string
  guardianEmail?: string
  guardianAddress?: string

  // Education
  previousSchool: string
  graduationYear: number
  grades?: string

  // Program
  courseId: string
  collegeId: string

  // Documents (Optional for now, or URLs handled separately)
  passportPhotoUrl?: string
  transcriptUrl?: string
  idCardUrl?: string
}

export async function submitStudentApplication(data: StudentApplicationData) {
  try {
    // Check if email exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: "Email already exists. Please login if you have an account." }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Transaction to create User and Application
    const result = await db.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: "APPLICANT",
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          collegeId: data.collegeId,
          isActive: false, // Inactive until approved
        }
      })

      // 2. Create Application
      const application = await tx.application.create({
        data: {
          userId: user.id,
          dateOfBirth: data.dateOfBirth, // Stored in both for now, or remove from User
          gender: data.gender,
          nationality: data.nationality,
          religion: data.religion,
          placeOfBirth: data.placeOfBirth,
          address: data.address,

          guardianName: data.guardianName,
          guardianRelationship: data.guardianRelationship,
          guardianPhone: data.guardianPhone,
          guardianEmail: data.guardianEmail,
          guardianAddress: data.guardianAddress,

          previousSchool: data.previousSchool,
          graduationYear: data.graduationYear,
          grades: data.grades,

          courseId: data.courseId,

          passportPhotoUrl: data.passportPhotoUrl,
          transcriptUrl: data.transcriptUrl,
          idCardUrl: data.idCardUrl,

          status: "PENDING"
        }
      })

      return user
    })

    return { success: true, userId: result.id }
  } catch (error) {
    console.error("Error submitting application:", error)
    return { success: false, error: "Failed to submit application. Please try again." }
  }
}

export async function registerUser(data: RegisterData) {
  // Keeping this for backward compatibility or lecturer registration
  // ... (original implementation)
  try {
    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Determine role and status
    // If Student, they become APPLICANT and inactive
    // If Lecturer, they become LECTURER and inactive (pending approval)
    const dbRole = data.role === "STUDENT" ? "APPLICANT" : data.role
    const isActive = false

    // Create user
    await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: dbRole as UserRole,
        studentId: data.studentId || null,
        phone: data.phone || null,
        isActive: isActive,
        appliedCourse: data.role === "STUDENT" && data.courseId ? {
          connect: { id: data.courseId }
        } : undefined,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, error: "Failed to create application" }
  }
}




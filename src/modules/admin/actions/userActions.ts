"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"
import { randomUUID } from "crypto"

interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string | null
  departmentId?: string | null
}

interface UpdateUserData {
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  departmentId?: string | null
  isActive: boolean
}

async function generateUniqueId(prefix: string) {
  // Try a few times to avoid collisions; fall back to default cuid if needed
  for (let i = 0; i < 5; i++) {
    const random = Math.floor(10000 + Math.random() * 90000)
    const candidate = `${prefix}-${random}`
    const existing = await db.user.findUnique({
      where: { studentId: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
  }
  // Extremely unlikely fallback
  return `${prefix}-${randomUUID().slice(0, 8)}`
}

export async function createUser(data: CreateUserData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    // Auto-generate a unique ID for students and lecturers
    let generatedId: string | null = null
    if (data.role === "STUDENT") {
      generatedId = await generateUniqueId("STU")
    } else if (data.role === "LECTURER") {
      generatedId = await generateUniqueId("LEC")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      studentId: generatedId,
        phone: data.phone || null,
        departmentId: data.departmentId || null,
      },
    })

    revalidatePath("/admin/students")
    revalidatePath("/admin/lecturers")
    return { success: true }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function updateUser(userId: string, data: UpdateUserData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if email already exists (for other users)
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser && existingUser.id !== userId) {
      return { success: false, error: "Email already exists" }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        departmentId: data.departmentId || null,
        isActive: data.isActive,
      },
    })

    revalidatePath("/admin/students")
    revalidatePath("/admin/lecturers")
    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Don't allow deleting yourself
    if (userId === session.user.id) {
      return { success: false, error: "Cannot delete your own account" }
    }

    await db.user.delete({
      where: { id: userId },
    })

    revalidatePath("/admin/students")
    revalidatePath("/admin/lecturers")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}





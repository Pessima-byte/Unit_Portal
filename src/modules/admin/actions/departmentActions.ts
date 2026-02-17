"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface DepartmentData {
  name: string
  description: string | null
  studentCount?: number
  lecturerCount?: number
  staffCount?: number
  courseCount?: number
  totalSalary?: number
}

async function generateDepartmentCode(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 4) || "DEPT"

  for (let i = 0; i < 5; i++) {
    const random = Math.floor(100 + Math.random() * 900)
    const candidate = `${initials}-${random}`
    const existing = await db.department.findUnique({
      where: { code: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
  }
  return `${initials}-${Date.now().toString().slice(-4)}`
}

export async function createDepartment(data: DepartmentData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Generate a unique department code (or let user provide one? For now auto-generate like before)
    const generatedCode = await generateDepartmentCode(data.name)

    // Check if name already exists
    const existing = await db.department.findFirst({
      where: { name: data.name },
    })

    if (existing) {
      return { success: false, error: "Department name already exists" }
    }

    await db.department.create({
      data: {
        name: data.name,
        code: generatedCode,
        description: data.description,
        studentCount: data.studentCount || 0,
        lecturerCount: data.lecturerCount || 0,
        staffCount: data.staffCount || 0,
        courseCount: data.courseCount || 0,
        totalSalary: data.totalSalary || 0,
      },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error) {
    console.error("Error creating department:", error)
    return { success: false, error: "Failed to create department" }
  }
}

export async function updateDepartment(departmentId: string, data: DepartmentData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if name already exists
    const existing = await db.department.findFirst({
      where: {
        AND: [
          { id: { not: departmentId } },
          { name: data.name },
        ],
      },
    })

    if (existing) {
      return { success: false, error: "Department name already exists" }
    }

    // Preserve existing code
    const current = await db.department.findUnique({
      where: { id: departmentId },
      select: { code: true },
    })

    await db.department.update({
      where: { id: departmentId },
      data: {
        name: data.name,
        code: current?.code, // undefined behavior handled by Prisma? Actually, typically we don't need to pass it if we don't want to update it.
        // But the previous code had `code: current?.code || undefined`. I'll stick to not updating it if possible, or just passing current code.
        // Wait, if I don't include `code` in `data` at all, it won't be updated.
        description: data.description,
        studentCount: data.studentCount,
        lecturerCount: data.lecturerCount,
        staffCount: data.staffCount,
        courseCount: data.courseCount,
        totalSalary: data.totalSalary,
      },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error) {
    console.error("Error updating department:", error)
    return { success: false, error: "Failed to update department" }
  }
}

export async function deleteDepartment(departmentId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Check if department has users or courses
    const department = await db.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            users: true,
            courses: true,
          },
        },
      },
    })

    if (!department) {
      return { success: false, error: "Department not found" }
    }

    if (department._count.users > 0 || department._count.courses > 0) {
      return {
        success: false,
        error: "Cannot delete department with users or courses",
      }
    }

    await db.department.delete({
      where: { id: departmentId },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting department:", error)
    return { success: false, error: "Failed to delete department" }
  }
}





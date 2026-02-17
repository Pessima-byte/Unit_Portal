import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseManagement } from "@/modules/admin/components/CourseManagement"
import { getPaginationParams, calculateTotalPages } from "@/lib/pagination"
import { Pagination } from "@/components/shared/Pagination"

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null
  }

  const { page, skip, take } = getPaginationParams(searchParams)

  // Fetch courses with pagination and optimized query
  const [courses, totalCount] = await Promise.all([
    db.course.findMany({
      include: {
        department: true,
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
        enrollments: {
          where: { status: "ACTIVE" },
        },
      },
      orderBy: { code: "asc" },
      skip,
      take,
    }),
    db.course.count(),
  ])

  const totalPages = calculateTotalPages(totalCount)

  // Fetch departments and lecturers for forms
  const [departments, lecturers] = await Promise.all([
    db.department.findMany({
      orderBy: { name: "asc" },
    }),
    db.user.findMany({
      where: { role: "LECTURER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { lastName: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">Create and manage courses</p>
      </div>

      <CourseManagement
        courses={courses}
        departments={departments}
        lecturers={lecturers}
      />

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/courses"
          />
        </div>
      )}
    </div>
  )
}



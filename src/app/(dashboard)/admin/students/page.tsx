import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserManagement } from "@/modules/admin/components/UserManagement"
import { Plus } from "lucide-react"
import { getPaginationParams, calculateTotalPages } from "@/lib/pagination"
import { Pagination } from "@/components/shared/Pagination"

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null
  }

  const { page, skip, take } = getPaginationParams(searchParams)

  // Fetch students with pagination and optimized query
  const [students, totalCount] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT" },
      include: {
        department: true,
        enrollments: {
          where: { status: "ACTIVE" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.user.count({
      where: { role: "STUDENT" },
    }),
  ])

  const totalPages = calculateTotalPages(totalCount)

  // Fetch departments for the form
  const departments = await db.department.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage student accounts and information</p>
        </div>
      </div>

      <UserManagement
        users={students}
        userType="STUDENT"
        departments={departments}
      />

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/students"
          />
        </div>
      )}
    </div>
  )
}



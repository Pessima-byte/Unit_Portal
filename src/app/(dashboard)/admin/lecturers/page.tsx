import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserManagement } from "@/modules/admin/components/UserManagement"

export default async function AdminLecturersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null
  }

  // Fetch all lecturers
  const lecturers = await db.user.findMany({
    where: { role: "LECTURER" },
    include: {
      department: true,
      courses: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch departments for the form
  const departments = await db.department.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lecturer Management</h1>
        <p className="text-muted-foreground">Manage lecturer accounts and information</p>
      </div>

      <UserManagement
        users={lecturers}
        userType="LECTURER"
        departments={departments}
      />
    </div>
  )
}





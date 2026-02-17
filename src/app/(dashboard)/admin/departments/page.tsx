import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DepartmentManagement } from "@/modules/admin/components/DepartmentManagement"

export default async function AdminDepartmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null
  }

  // Fetch all departments
  // Fetch all departments
  const departmentsData = await db.department.findMany({
    orderBy: { name: "asc" },
  })

  // Process data to calculate stats (now using manual fields)
  const departments = departmentsData.map((dept) => {
    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      stats: {
        courses: dept.courseCount,
        students: dept.studentCount,
        lecturers: dept.lecturerCount,
        workers: dept.staffCount,
        totalSalary: dept.totalSalary,
      },
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Department Management</h1>
        <p className="text-muted-foreground">Create and manage departments</p>
      </div>

      <DepartmentManagement departments={departments} />
    </div>
  )
}





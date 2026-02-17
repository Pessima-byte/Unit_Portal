import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResultsApproval } from "@/modules/admin/components/ResultsApproval"

export default async function AdminResultsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null
  }

  // Fetch pending grades
  const pendingGrades = await db.grade.findMany({
    where: { status: "PENDING" },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          studentId: true,
        },
      },
      course: {
        select: {
          code: true,
          name: true,
        },
      },
      assignment: {
        select: {
          title: true,
        },
      },
      gradedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Results Approval</h1>
        <p className="text-muted-foreground">Review and approve student grades</p>
      </div>

      <ResultsApproval grades={pendingGrades} />
    </div>
  )
}





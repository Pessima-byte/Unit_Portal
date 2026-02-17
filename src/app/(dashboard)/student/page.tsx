import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, GraduationCap, Calendar, CreditCard } from "lucide-react"

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const studentId = session.user.id

  // Fetch student statistics
  const [enrollments, grades, payments] = await Promise.all([
    db.courseEnrollment.count({
      where: { studentId, status: "ACTIVE" },
    }),
    db.grade.findMany({
      where: { studentId },
      include: { course: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({
      where: { studentId },
      include: { feeStructure: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const totalCourses = enrollments
  const recentGrades = grades
  const recentPayments = payments

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentGrades.length}</div>
            <p className="text-xs text-muted-foreground">
              Latest updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timetable</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">View</div>
            <p className="text-xs text-muted-foreground">
              Your schedule
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
          <CardDescription>Your latest grade updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentGrades.length > 0 ? (
            <div className="space-y-4">
              {recentGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{grade.course?.name || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">
                      {grade.letterGrade || "N/A"} - {grade.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {grade.score}/{grade.maxScore}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {grade.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No grades available yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





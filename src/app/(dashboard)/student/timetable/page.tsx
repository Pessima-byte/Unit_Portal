import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StudentTimetablePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const studentId = session.user.id

  // Fetch enrolled courses with their schedules
  const enrollments = await db.courseEnrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    include: {
      course: {
        include: {
          department: true,
          lecturer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  // Group courses by day (simplified - in real app, you'd have a Schedule model)
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timetable: Record<string, typeof enrollments> = {}

  days.forEach((day) => {
    timetable[day] = []
  })

  // For now, distribute courses across days (in real app, use actual schedule data)
  enrollments.forEach((enrollment, index) => {
    const dayIndex = index % days.length
    timetable[days[dayIndex]].push(enrollment)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Timetable</h1>
        <p className="text-muted-foreground">View your class schedule</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {days.map((day) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="text-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent>
              {timetable[day].length > 0 ? (
                <div className="space-y-3">
                  {timetable[day].map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <p className="font-semibold">{enrollment.course.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.course.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {enrollment.course.lecturer
                          ? `${enrollment.course.lecturer.firstName} ${enrollment.course.lecturer.lastName}`
                          : "TBA"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {enrollment.course.creditUnits} credits
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No classes
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {enrollments.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You are not enrolled in any courses yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}





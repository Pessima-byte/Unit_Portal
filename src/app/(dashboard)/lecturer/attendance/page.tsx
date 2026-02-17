import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceForm } from "@/modules/lecturer/components/AttendanceForm"

export default async function LecturerAttendancePage({
  searchParams,
}: {
  searchParams: { courseId?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const lecturerId = session.user.id
  const courseId = searchParams.courseId

  // Fetch lecturer's courses
  const courses = await db.course.findMany({
    where: { lecturerId },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
            },
          },
        },
      },
    },
    orderBy: { code: "asc" },
  })

  const selectedCourse = courseId
    ? courses.find((c) => c.id === courseId) || null
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <p className="text-muted-foreground">Track student attendance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Record attendance for a course</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceForm courses={courses} selectedCourse={selectedCourse} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>View attendance history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Attendance records will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



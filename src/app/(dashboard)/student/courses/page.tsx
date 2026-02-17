import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CourseRegistrationForm } from "@/modules/student/components/CourseRegistrationForm"
import { EnrolledCoursesList } from "@/modules/student/components/EnrolledCoursesList"

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const studentId = session.user.id

  // Fetch available courses and enrolled courses
  const [availableCourses, enrolledCourses] = await Promise.all([
    db.course.findMany({
      where: { isActive: true },
      include: {
        department: true,
        lecturer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
      orderBy: { code: "asc" },
    }),
    db.courseEnrollment.findMany({
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
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Registration</h1>
        <p className="text-muted-foreground">
          Register for courses and manage your enrollments
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>
              Browse and register for courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseRegistrationForm
              courses={availableCourses}
              enrolledCourseIds={enrolledCourses.map((e) => e.courseId)}
            />
          </CardContent>
        </Card>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Enrolled Courses</CardTitle>
            <CardDescription>
              Courses you are currently enrolled in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnrolledCoursesList enrolledCourses={enrolledCourses} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





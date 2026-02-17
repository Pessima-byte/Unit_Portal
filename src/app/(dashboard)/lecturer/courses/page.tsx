import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Calendar } from "lucide-react"

export default async function LecturerCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const lecturerId = session.user.id

  // Fetch lecturer's courses with enrollment info
  const courses = await db.course.findMany({
    where: { lecturerId },
    include: {
      department: true,
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { code: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Manage your assigned courses</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{course.code}</CardTitle>
                    <CardDescription>{course.name}</CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {course.creditUnits} credits
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {course.enrollments.length} / {course.maxStudents || "∞"} students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {course.semester} {course.academicYear}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Department: {course.department.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Student Roster</h4>
                  {course.enrollments.length > 0 ? (
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {course.enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between rounded border p-2 text-xs"
                        >
                          <div>
                            <p className="font-medium">
                              {enrollment.student.firstName} {enrollment.student.lastName}
                            </p>
                            <p className="text-muted-foreground">
                              {enrollment.student.studentId || enrollment.student.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No students enrolled</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/lecturer/materials?courseId=${course.id}`}>
                    <Button variant="outline" size="sm">
                      Materials
                    </Button>
                  </Link>
                  <Link href={`/lecturer/assignments?courseId=${course.id}`}>
                    <Button variant="outline" size="sm">
                      Assignments
                    </Button>
                  </Link>
                  <Link href={`/lecturer/grading?courseId=${course.id}`}>
                    <Button variant="outline" size="sm">
                      Grade
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                You are not assigned to any courses yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}





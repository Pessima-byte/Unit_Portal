import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GradingInterface } from "@/modules/lecturer/components/GradingInterface"

export default async function LecturerGradingPage({
  searchParams,
}: {
  searchParams: { courseId?: string; assignmentId?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const lecturerId = session.user.id
  const { courseId, assignmentId } = searchParams

  // Fetch courses and assignments
  const [courses, assignments] = await Promise.all([
    db.course.findMany({
      where: { lecturerId },
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { code: "asc" },
    }),
    assignmentId
      ? db.assignment.findUnique({
          where: { id: assignmentId },
          include: {
            course: true,
            submissions: {
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    studentId: true,
                  },
                  include: {
                    grades: {
                      where: { assignmentId },
                    },
                  },
                },
              },
            },
          },
        })
      : null,
  ])

  // If no assignment selected, fetch all students in the course
  let students = null
  if (courseId && !assignmentId) {
    const course = await db.course.findUnique({
      where: { id: courseId, lecturerId },
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
              include: {
                grades: {
                  where: { courseId },
                },
              },
            },
          },
        },
      },
    })
    students = course?.enrollments.map((e) => e.student) || []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grading</h1>
        <p className="text-muted-foreground">Grade student assignments and course work</p>
      </div>

      <GradingInterface
        courses={courses}
        selectedCourseId={courseId}
        selectedAssignment={assignments}
        students={students}
      />
    </div>
  )
}





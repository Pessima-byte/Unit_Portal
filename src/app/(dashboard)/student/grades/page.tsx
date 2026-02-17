import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const studentId = session.user.id

  // Fetch all grades grouped by course
  const grades = await db.grade.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          department: true,
        },
      },
      assignment: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Group grades by course
  const gradesByCourse = grades.reduce((acc, grade) => {
    const courseId = grade.courseId
    if (!acc[courseId]) {
      acc[courseId] = {
        course: grade.course,
        grades: [],
      }
    }
    acc[courseId].grades.push(grade)
    return acc
  }, {} as Record<string, { course: typeof grades[0]["course"]; grades: typeof grades }>)

  // Calculate GPA (simplified)
  const calculateGPA = (courseGrades: typeof grades) => {
    if (courseGrades.length === 0) return 0
    const total = courseGrades.reduce((sum, grade) => sum + grade.percentage, 0)
    return total / courseGrades.length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Grades</h1>
        <p className="text-muted-foreground">View your academic performance</p>
      </div>

      {Object.keys(gradesByCourse).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(gradesByCourse).map(([courseId, { course, grades: courseGrades }]) => {
            const courseGPA = calculateGPA(courseGrades)
            return (
              <Card key={courseId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{course.code} - {course.name}</CardTitle>
                      <CardDescription>{course.department.name}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{courseGPA.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Course Average</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {grade.assignment?.title || "Course Grade"}
                          </p>
                          {grade.assignment && (
                            <p className="text-xs text-muted-foreground">
                              Assignment
                            </p>
                          )}
                          {grade.remarks && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {grade.remarks}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {grade.score}/{grade.maxScore}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {grade.letterGrade || "N/A"} ({grade.percentage.toFixed(1)}%)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {grade.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No grades available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}





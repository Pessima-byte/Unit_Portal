import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TranscriptGenerator } from "@/modules/student/components/TranscriptGenerator"

export default async function StudentTranscriptsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const studentId = session.user.id

  // Fetch all completed courses with grades
  const enrollments = await db.courseEnrollment.findMany({
    where: {
      studentId,
      status: { in: ["COMPLETED", "ACTIVE"] },
    },
    include: {
      course: {
        include: {
          department: true,
        },
      },
      student: {
        select: {
          firstName: true,
          lastName: true,
          studentId: true,
          email: true,
        },
      },
    },
    orderBy: {
      course: {
        level: "asc",
      },
    },
  })

  // Get grades for each course
  const coursesWithGrades = await Promise.all(
    enrollments.map(async (enrollment) => {
      const grades = await db.grade.findMany({
        where: {
          studentId,
          courseId: enrollment.courseId,
          status: "APPROVED",
        },
        include: {
          assignment: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      const courseAverage =
        grades.length > 0
          ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
          : null

      return {
        enrollment,
        grades,
        courseAverage,
      }
    })
  )

  const totalCredits = coursesWithGrades.reduce(
    (sum, { enrollment }) => sum + enrollment.course.creditUnits,
    0
  )

  const calculateGPA = () => {
    const gradedCourses = coursesWithGrades.filter((c) => c.courseAverage !== null)
    if (gradedCourses.length === 0) return 0

    const totalPoints = gradedCourses.reduce(
      (sum, { courseAverage, enrollment }) => sum + (courseAverage || 0) * enrollment.course.creditUnits,
      0
    )

    return totalPoints / totalCredits
  }

  const gpa = calculateGPA()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Transcript</h1>
          <p className="text-muted-foreground">Your complete academic record</p>
        </div>
        <TranscriptGenerator
          studentName={session.user.name}
          studentId={session.user.studentId}
          studentEmail={session.user.email}
          gpa={gpa}
          totalCredits={totalCredits}
          courses={coursesWithGrades.map(({ enrollment, courseAverage }) => ({
            code: enrollment.course.code,
            name: enrollment.course.name,
            creditUnits: enrollment.course.creditUnits,
            department: enrollment.course.department.name,
            level: enrollment.course.level,
            semester: enrollment.course.semester,
            academicYear: enrollment.course.academicYear,
            average: courseAverage,
            letterGrade: courseAverage
              ? courseAverage >= 90
                ? "A"
                : courseAverage >= 80
                ? "B"
                : courseAverage >= 70
                ? "C"
                : courseAverage >= 60
                ? "D"
                : "F"
              : null,
          }))}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {session.user.name}
              </CardTitle>
              <CardDescription>
                Student ID: {session.user.studentId || "N/A"}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">GPA: {gpa.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                Total Credits: {totalCredits}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {coursesWithGrades.length > 0 ? (
              coursesWithGrades.map(({ enrollment, grades, courseAverage }) => (
                <div key={enrollment.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{enrollment.course.code}</h3>
                        <span className="text-xs text-muted-foreground">
                          {enrollment.course.creditUnits} credits
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.course.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.course.department.name} • Level {enrollment.course.level}
                      </p>
                      {grades.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {grades.map((grade) => (
                            <div key={grade.id} className="text-xs text-muted-foreground">
                              {grade.assignment ? "Assignment" : "Course Grade"}: {grade.letterGrade || "N/A"} (
                              {grade.percentage.toFixed(1)}%)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {courseAverage !== null ? (
                        <>
                          <p className="font-semibold">{courseAverage.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Average</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No grades yet</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No academic records available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



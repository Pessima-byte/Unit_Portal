import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PrerequisitesManagement } from "@/modules/course/components/PrerequisitesManagement"

export default async function CoursePrerequisitesPage({
  params,
}: {
  params: { courseId: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const { courseId } = params

  // Fetch course with prerequisites
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      prerequisites: {
        include: {
          prerequisite: {
            include: {
              department: true,
            },
          },
        },
      },
      department: true,
    },
  })

  if (!course) {
    redirect("/admin/courses")
  }

  // Fetch all courses for selection (excluding current course)
  const allCourses = await db.course.findMany({
    where: {
      id: { not: courseId },
    },
    include: {
      department: true,
    },
    orderBy: { code: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Prerequisites</h1>
        <p className="text-muted-foreground">
          Manage prerequisites for {course.code} - {course.name}
        </p>
      </div>

      <PrerequisitesManagement
        course={course}
        availableCourses={allCourses}
      />
    </div>
  )
}





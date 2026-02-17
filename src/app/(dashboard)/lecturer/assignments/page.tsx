import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateAssignmentForm } from "@/modules/lecturer/components/CreateAssignmentForm"
import { AssignmentsList } from "@/modules/lecturer/components/AssignmentsList"
import { Plus } from "lucide-react"

export default async function LecturerAssignmentsPage({
  searchParams,
}: {
  searchParams: { courseId?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const lecturerId = session.user.id
  const courseId = searchParams.courseId

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
    db.assignment.findMany({
      where: {
        lecturerId,
        ...(courseId && { courseId }),
      },
      include: {
        course: {
          select: {
            code: true,
            name: true,
          },
        },
        submissions: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Create and manage assignments</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>Add a new assignment for your course</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAssignmentForm courses={courses} />
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>My Assignments</CardTitle>
            <CardDescription>
              {courseId ? "Filtered by course" : "All assignments"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignmentsList assignments={assignments} courses={courses} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





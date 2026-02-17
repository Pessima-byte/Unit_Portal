import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MaterialsUpload } from "@/modules/lecturer/components/MaterialsUpload"

export default async function LecturerMaterialsPage({
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
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: { code: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Materials</h1>
        <p className="text-muted-foreground">Upload and manage course materials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Materials</CardTitle>
          <CardDescription>
            Upload files, documents, and resources for your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialsUpload courses={courses} selectedCourseId={courseId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Materials</CardTitle>
          <CardDescription>Your course materials</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            File upload functionality will be implemented with file storage integration.
            For now, materials can be referenced via URLs in the course description.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}





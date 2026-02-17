"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { unenrollCourse } from "@/modules/student/actions/courseActions"
import { useState, useTransition } from "react"

interface EnrolledCourse {
  id: string
  course: {
    id: string
    code: string
    name: string
    creditUnits: number
    department: {
      name: string
    }
    lecturer: {
      firstName: string
      lastName: string
    } | null
  }
  enrolledAt: Date
}

interface EnrolledCoursesListProps {
  enrolledCourses: EnrolledCourse[]
}

export function EnrolledCoursesList({ enrolledCourses }: EnrolledCoursesListProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleUnenroll = async (enrollmentId: string) => {
    startTransition(async () => {
      try {
        const result = await unenrollCourse(enrollmentId)
        if (result.success) {
          setMessage({ type: "success", text: "Successfully unenrolled from course!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to unenroll" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>You are not enrolled in any courses yet.</p>
        <p className="mt-2 text-sm">Browse available courses to register.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {enrolledCourses.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{enrollment.course.code}</h3>
                    <span className="text-xs text-muted-foreground">
                      {enrollment.course.creditUnits} credits
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{enrollment.course.name}</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Department: {enrollment.course.department.name}</p>
                    {enrollment.course.lecturer && (
                      <p>
                        Lecturer: {enrollment.course.lecturer.firstName}{" "}
                        {enrollment.course.lecturer.lastName}
                      </p>
                    )}
                    <p>
                      Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUnenroll(enrollment.id)}
                  disabled={isPending}
                  size="sm"
                  variant="destructive"
                >
                  Unenroll
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}





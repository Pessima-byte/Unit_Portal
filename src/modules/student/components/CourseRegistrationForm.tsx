"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { registerCourse } from "@/modules/student/actions/courseActions"

interface Course {
  id: string
  code: string
  name: string
  creditUnits: number
  level: number
  semester: string
  department: {
    name: string
  }
  lecturer: {
    firstName: string
    lastName: string
  } | null
  prerequisites: Array<{
    prerequisite: {
      code: string
      name: string
    }
  }>
}

interface CourseRegistrationFormProps {
  courses: Course[]
  enrolledCourseIds: string[]
}

export function CourseRegistrationForm({
  courses,
  enrolledCourseIds,
}: CourseRegistrationFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRegister = async (courseId: string) => {
    if (enrolledCourseIds.includes(courseId)) {
      setMessage({ type: "error", text: "You are already enrolled in this course" })
      return
    }

    startTransition(async () => {
      try {
        const result = await registerCourse(courseId)
        if (result.success) {
          setMessage({ type: "success", text: "Successfully enrolled in course!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to enroll" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

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

      <div className="max-h-[600px] space-y-2 overflow-y-auto">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id)
            return (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{course.code}</h3>
                        <span className="text-xs text-muted-foreground">
                          {course.creditUnits} credits
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{course.name}</p>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Department: {course.department.name}</p>
                        {course.lecturer && (
                          <p>
                            Lecturer: {course.lecturer.firstName} {course.lecturer.lastName}
                          </p>
                        )}
                        <p>
                          Level {course.level} • {course.semester}
                        </p>
                        {course.prerequisites.length > 0 && (
                          <p>
                            Prerequisites:{" "}
                            {course.prerequisites
                              .map((p) => p.prerequisite.code)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRegister(course.id)}
                      disabled={isEnrolled || isPending}
                      size="sm"
                      variant={isEnrolled ? "secondary" : "default"}
                    >
                      {isEnrolled ? "Enrolled" : "Register"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <p className="text-center text-muted-foreground">No courses found</p>
        )}
      </div>
    </div>
  )
}





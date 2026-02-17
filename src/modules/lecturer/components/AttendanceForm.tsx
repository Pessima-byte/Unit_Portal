"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { markAttendance } from "@/modules/lecturer/actions/attendanceActions"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  code: string
  name: string
  enrollments: Array<{
    id: string
    student: {
      id: string
      firstName: string
      lastName: string
      studentId: string | null
    }
  }>
}

interface AttendanceFormProps {
  courses: Course[]
  selectedCourse: Course | null
}

export function AttendanceForm({ courses, selectedCourse }: AttendanceFormProps) {
  const router = useRouter()
  const [selectedCourseId, setSelectedCourseId] = useState(selectedCourse?.id || "")
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    router.push(`/lecturer/attendance?courseId=${courseId}`)
  }

  const currentCourse = courses.find((c) => c.id === selectedCourseId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId || !attendanceDate) {
      setMessage({ type: "error", text: "Please select a course and date" })
      return
    }

    const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }))

    if (attendanceRecords.length === 0) {
      setMessage({ type: "error", text: "Please mark attendance for at least one student" })
      return
    }

    startTransition(async () => {
      try {
        const result = await markAttendance({
          courseId: selectedCourseId,
          date: new Date(attendanceDate),
          records: attendanceRecords,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Attendance marked successfully!" })
          setAttendance({})
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to mark attendance" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="course">Select Course</Label>
        <select
          id="course"
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select a course...</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          required
        />
      </div>

      {currentCourse && currentCourse.enrollments.length > 0 && (
        <div className="space-y-3">
          <Label>Mark Attendance</Label>
          <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3">
            {currentCourse.enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between rounded border p-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {enrollment.student.studentId || "No ID"}
                  </p>
                </div>
                <select
                  value={attendance[enrollment.student.id] || ""}
                  onChange={(e) =>
                    setAttendance({
                      ...attendance,
                      [enrollment.student.id]: e.target.value,
                    })
                  }
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value="">-</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="EXCUSED">Excused</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending || !currentCourse}>
        {isPending ? "Saving..." : "Save Attendance"}
      </Button>
    </form>
  )
}





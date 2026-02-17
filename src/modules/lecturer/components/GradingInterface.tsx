"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitGrade } from "@/modules/lecturer/actions/gradingActions"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  code: string
  name: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  studentId: string | null
  grades: Array<{
    id: string
    score: number
    maxScore: number
    percentage: number
    letterGrade: string | null
  }>
}

interface Assignment {
  id: string
  title: string
  maxScore: number
  course: {
    code: string
    name: string
  }
  submissions: Array<{
    id: string
    student: Student
  }>
}

interface GradingInterfaceProps {
  courses: Course[]
  selectedCourseId?: string
  selectedAssignment: Assignment | null
  students: Student[] | null
}

export function GradingInterface({
  courses,
  selectedCourseId,
  selectedAssignment,
  students,
}: GradingInterfaceProps) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState(selectedCourseId || "")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
    router.push(`/lecturer/grading?courseId=${courseId}`)
  }

  if (selectedAssignment) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">{selectedAssignment.title}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedAssignment.course.code} - {selectedAssignment.course.name}
            </p>
            <p className="mt-2 text-sm">Max Score: {selectedAssignment.maxScore}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedAssignment.submissions.map((submission) => (
            <GradeForm
              key={submission.id}
              student={submission.student}
              assignmentId={selectedAssignment.id}
              courseId={selectedAssignment.course.code}
              maxScore={selectedAssignment.maxScore}
              existingGrade={submission.student.grades[0]}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="course">Select Course</Label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {students && students.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Course Grades</h2>
            <div className="space-y-4">
              {students.map((student) => (
                <GradeForm
                  key={student.id}
                  student={student}
                  courseId={selectedCourse}
                  maxScore={100}
                  existingGrade={student.grades[0]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Select a course to start grading</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GradeForm({
  student,
  assignmentId,
  courseId,
  maxScore,
  existingGrade,
}: {
  student: Student
  assignmentId?: string
  courseId: string
  maxScore: number
  existingGrade?: {
    id: string
    score: number
    maxScore: number
    percentage: number
    letterGrade: string | null
  }
}) {
  const [score, setScore] = useState(existingGrade?.score.toString() || "")
  const [remarks, setRemarks] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const calculateLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const scoreValue = parseFloat(score)
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > maxScore) {
      setMessage({ type: "error", text: `Score must be between 0 and ${maxScore}` })
      return
    }

    startTransition(async () => {
      try {
        const percentage = (scoreValue / maxScore) * 100
        const letterGrade = calculateLetterGrade(percentage)

        const result = await submitGrade({
          studentId: student.id,
          courseId,
          assignmentId,
          score: scoreValue,
          maxScore,
          percentage,
          letterGrade,
          remarks: remarks || null,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Grade submitted successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to submit grade" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4">
      {message && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold">
          {student.firstName} {student.lastName}
        </h3>
        <p className="text-sm text-muted-foreground">
          {student.studentId || "No ID"}
        </p>
        {existingGrade && (
          <p className="mt-1 text-xs text-muted-foreground">
            Current: {existingGrade.score}/{existingGrade.maxScore} ({existingGrade.letterGrade || "N/A"})
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`score-${student.id}`}>Score</Label>
          <Input
            id={`score-${student.id}`}
            type="number"
            step="0.01"
            min="0"
            max={maxScore}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Max: {maxScore}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`remarks-${student.id}`}>Remarks</Label>
          <Input
            id={`remarks-${student.id}`}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional remarks"
          />
        </div>
      </div>

      <Button type="submit" className="mt-4" disabled={isPending}>
        {isPending ? "Submitting..." : existingGrade ? "Update Grade" : "Submit Grade"}
      </Button>
    </form>
  )
}





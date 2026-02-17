"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { approveGrade, rejectGrade } from "@/modules/admin/actions/resultsActions"

interface Grade {
  id: string
  score: number
  maxScore: number
  percentage: number
  letterGrade: string | null
  remarks: string | null
  student: {
    firstName: string
    lastName: string
    studentId: string | null
  }
  course: {
    code: string
    name: string
  }
  assignment: {
    title: string
  } | null
  gradedBy: {
    firstName: string
    lastName: string
  } | null
  createdAt: Date
}

interface ResultsApprovalProps {
  grades: Grade[]
}

export function ResultsApproval({ grades }: ResultsApprovalProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleApprove = async (gradeId: string) => {
    startTransition(async () => {
      try {
        const result = await approveGrade(gradeId)
        if (result.success) {
          setMessage({ type: "success", text: "Grade approved successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to approve grade" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleReject = async (gradeId: string) => {
    if (!confirm("Are you sure you want to reject this grade?")) return

    startTransition(async () => {
      try {
        const result = await rejectGrade(gradeId)
        if (result.success) {
          setMessage({ type: "success", text: "Grade rejected successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to reject grade" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  if (grades.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No pending grades to approve</p>
        </CardContent>
      </Card>
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

      {grades.map((grade) => (
        <Card key={grade.id}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {grade.student.firstName} {grade.student.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {grade.student.studentId || "No ID"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {grade.score}/{grade.maxScore}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {grade.letterGrade || "N/A"} ({grade.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Course: </span>
                  {grade.course.code} - {grade.course.name}
                </div>
                {grade.assignment && (
                  <div>
                    <span className="font-medium">Assignment: </span>
                    {grade.assignment.title}
                  </div>
                )}
                {grade.gradedBy && (
                  <div>
                    <span className="font-medium">Graded by: </span>
                    {grade.gradedBy.firstName} {grade.gradedBy.lastName}
                  </div>
                )}
                {grade.remarks && (
                  <div>
                    <span className="font-medium">Remarks: </span>
                    {grade.remarks}
                  </div>
                )}
                <div>
                  <span className="font-medium">Submitted: </span>
                  {new Date(grade.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(grade.id)}
                  disabled={isPending}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(grade.id)}
                  disabled={isPending}
                >
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}





"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: Date
  maxScore: number
  course: {
    code: string
    name: string
  }
  submissions: Array<{
    id: string
    status: string
    student: {
      firstName: string
      lastName: string
    }
  }>
}

interface AssignmentsListProps {
  assignments: Assignment[]
  courses: Array<{ id: string; code: string; name: string }>
}

export function AssignmentsList({ assignments, courses }: AssignmentsListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No assignments created yet.</p>
        <p className="mt-2 text-sm">Create your first assignment on the left.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => {
        const pendingSubmissions = assignment.submissions.filter(
          (s) => s.status === "PENDING"
        ).length
        const totalSubmissions = assignment.submissions.length
        const isOverdue = new Date(assignment.dueDate) < new Date()

        return (
          <Card key={assignment.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{assignment.title}</h3>
                      {isOverdue && (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {assignment.course.code} - {assignment.course.name}
                    </p>
                    {assignment.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {totalSubmissions} submissions ({pendingSubmissions} pending)
                    </span>
                  </div>
                  <span>Max Score: {assignment.maxScore}</span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/lecturer/grading?assignmentId=${assignment.id}`}>
                    <Button size="sm" variant="default">
                      Grade Students
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}





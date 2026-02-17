"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { addPrerequisite, removePrerequisite } from "@/modules/course/actions/prerequisiteActions"
import { Trash2, Plus } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  code: string
  name: string
  department: {
    name: string
  }
  prerequisites: Array<{
    id: string
    prerequisite: {
      id: string
      code: string
      name: string
      department: {
        name: string
      }
    }
  }>
}

interface AvailableCourse {
  id: string
  code: string
  name: string
  department: {
    name: string
  }
}

interface PrerequisitesManagementProps {
  course: Course
  availableCourses: AvailableCourse[]
}

export function PrerequisitesManagement({
  course,
  availableCourses,
}: PrerequisitesManagementProps) {
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const existingPrerequisiteIds = course.prerequisites.map((p) => p.prerequisite.id)
  const availableForSelection = availableCourses.filter(
    (c) => !existingPrerequisiteIds.includes(c.id)
  )

  const handleAdd = async () => {
    if (!selectedCourseId) {
      setMessage({ type: "error", text: "Please select a course" })
      return
    }

    startTransition(async () => {
      try {
        const result = await addPrerequisite(course.id, selectedCourseId)
        if (result.success) {
          setMessage({ type: "success", text: "Prerequisite added successfully!" })
          setSelectedCourseId("")
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to add prerequisite" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleRemove = async (prerequisiteId: string) => {
    if (!confirm("Are you sure you want to remove this prerequisite?")) return

    startTransition(async () => {
      try {
        const result = await removePrerequisite(course.id, prerequisiteId)
        if (result.success) {
          setMessage({ type: "success", text: "Prerequisite removed successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to remove prerequisite" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between">
        <Link href="/admin/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>

      {/* Add Prerequisite */}
      <Card>
        <CardHeader>
          <CardTitle>Add Prerequisite</CardTitle>
          <CardDescription>
            Select a course that must be completed before enrolling in {course.code}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a course...</option>
              {availableForSelection.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.department.name})
                </option>
              ))}
            </select>
            <Button onClick={handleAdd} disabled={isPending || !selectedCourseId}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Current Prerequisites</CardTitle>
          <CardDescription>
            Courses that must be completed before enrolling in {course.code}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {course.prerequisites.length > 0 ? (
            <div className="space-y-3">
              {course.prerequisites.map((prereq) => (
                <div
                  key={prereq.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {prereq.prerequisite.code} - {prereq.prerequisite.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {prereq.prerequisite.department.name}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(prereq.prerequisite.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No prerequisites set. Students can enroll directly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





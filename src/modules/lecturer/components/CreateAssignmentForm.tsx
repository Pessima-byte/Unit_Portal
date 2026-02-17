"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAssignment } from "@/modules/lecturer/actions/assignmentActions"

interface Course {
  id: string
  code: string
  name: string
}

interface CreateAssignmentFormProps {
  courses: Course[]
}

export function CreateAssignmentForm({ courses }: CreateAssignmentFormProps) {
  const [courseId, setCourseId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxScore, setMaxScore] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !title || !dueDate || !maxScore) {
      setMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }

    startTransition(async () => {
      try {
        const result = await createAssignment({
          courseId,
          title,
          description,
          dueDate: new Date(dueDate),
          maxScore: parseFloat(maxScore),
        })

        if (result.success) {
          setMessage({ type: "success", text: "Assignment created successfully!" })
          setCourseId("")
          setTitle("")
          setDescription("")
          setDueDate("")
          setMaxScore("")
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to create assignment" })
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
        <Label htmlFor="course">Course *</Label>
        <select
          id="course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
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
        <Label htmlFor="title">Assignment Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter assignment title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter assignment description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxScore">Max Score *</Label>
          <Input
            id="maxScore"
            type="number"
            step="0.01"
            min="0"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            placeholder="100"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Assignment"}
      </Button>
    </form>
  )
}





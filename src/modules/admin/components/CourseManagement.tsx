"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseLevel } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCourse, updateCourse, deleteCourse } from "@/modules/admin/actions/courseActions"
import { Plus, Edit, Trash2, X } from "lucide-react"



interface Department {
  id: string
  name: string
  code: string
}

interface Lecturer {
  id: string
  firstName: string
  lastName: string
}

interface Prerequisite {
  prerequisite: {
    id: string
    code: string
    name: string
  }
}

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  creditUnits: number
  level: number
  type: CourseLevel
  requirements: string[]
  semester: string
  academicYear: string
  maxStudents: number | null
  currentStudents: number
  isActive: boolean
  department: Department
  lecturer: Lecturer | null
  prerequisites: Prerequisite[]
  enrollments: Array<{ id: string }>
}

interface CourseManagementProps {
  courses: Course[]
  departments: Department[]
  lecturers: Lecturer[]
}

export function CourseManagement({
  courses,
  departments,
  lecturers,
}: CourseManagementProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // State for requirements management
  const [requirements, setRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState("")

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const openCreate = () => {
    setRequirements([])
    setNewRequirement("")
    setIsCreating(true)
  }

  const openEdit = (course: Course) => {
    setRequirements(course.requirements || [])
    setNewRequirement("")
    setEditingCourse(course)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await createCourse({
          code: formData.get("code") as string,
          name: formData.get("name") as string,
          description: formData.get("description") as string || null,
          creditUnits: parseInt(formData.get("creditUnits") as string),
          level: parseInt(formData.get("level") as string),
          type: formData.get("type") as any, // Cast to any to assume matched enum
          requirements: requirements,
          semester: formData.get("semester") as string,
          academicYear: formData.get("academicYear") as string,
          maxStudents: formData.get("maxStudents")
            ? parseInt(formData.get("maxStudents") as string)
            : null,
          departmentId: formData.get("departmentId") as string,
          lecturerId: formData.get("lecturerId") as string || null,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Course created successfully!" })
          setIsCreating(false)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to create course" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCourse) return

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await updateCourse(editingCourse.id, {
          code: formData.get("code") as string,
          name: formData.get("name") as string,
          description: formData.get("description") as string || null,
          creditUnits: parseInt(formData.get("creditUnits") as string),
          level: parseInt(formData.get("level") as string),
          type: formData.get("type") as any,
          requirements: requirements,
          semester: formData.get("semester") as string,
          academicYear: formData.get("academicYear") as string,
          maxStudents: formData.get("maxStudents")
            ? parseInt(formData.get("maxStudents") as string)
            : null,
          departmentId: formData.get("departmentId") as string,
          lecturerId: formData.get("lecturerId") as string || null,
          isActive: formData.get("isActive") === "true",
        })

        if (result.success) {
          setMessage({ type: "success", text: "Course updated successfully!" })
          setEditingCourse(null)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update course" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    startTransition(async () => {
      try {
        const result = await deleteCourse(courseId)
        if (result.success) {
          setMessage({ type: "success", text: "Course deleted successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete course" })
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
          className={`rounded-md p-3 text-sm ${message.type === "success"
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
            <CardDescription>Add a new course to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code *</Label>
                  <Input id="code" name="code" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input id="name" name="name" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Program Level *</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {Object.values(CourseLevel).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  {/* Placeholder to balance grid */}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddRequirement} variant="secondary">Add</Button>
                </div>
                <ul className="space-y-2 mt-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                      <span>{req}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRequirement(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditUnits">Credit Units *</Label>
                  <Input
                    id="creditUnits"
                    name="creditUnits"
                    type="number"
                    min="1"
                    defaultValue="3"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level (100-900) *</Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    min="100"
                    max="900"
                    step="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <select
                    id="semester"
                    name="semester"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Input
                    id="academicYear"
                    name="academicYear"
                    placeholder="2024-2025"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department *</Label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturerId">Lecturer</Label>
                  <select
                    id="lecturerId"
                    name="lecturerId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Assign later...</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.firstName} {lecturer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students (optional)</Label>
                <Input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Course"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Manage courses in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{course.code} - {course.name}</h3>
                    {!course.isActive && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                        Inactive
                      </span>
                    )}
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {course.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.department.name} • {course.creditUnits} credits • Level {course.level}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {course.semester} {course.academicYear} • {course.enrollments.length} students
                    {course.maxStudents && ` / ${course.maxStudents} max`}
                  </p>
                  {course.requirements && course.requirements.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Requirements:</strong> {course.requirements.join(", ")}
                    </p>
                  )}
                  {course.lecturer && (
                    <p className="text-xs text-muted-foreground">
                      Lecturer: {course.lecturer.firstName} {course.lecturer.lastName}
                    </p>
                  )}
                  {course.prerequisites.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Prerequisites: {course.prerequisites.map((p) => p.prerequisite.code).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`/admin/courses/${course.id}/prerequisites`}>
                      Prerequisites
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editingCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Course</CardTitle>
            <CardDescription>Update course information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Course Code *</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    defaultValue={editingCourse.code}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Course Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingCourse.name}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingCourse.description || ""}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Program Level *</Label>
                  <select
                    id="edit-type"
                    name="type"
                    defaultValue={editingCourse.type}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {Object.values(CourseLevel).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddRequirement} variant="secondary">Add</Button>
                </div>
                <ul className="space-y-2 mt-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                      <span>{req}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRequirement(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-creditUnits">Credit Units *</Label>
                  <Input
                    id="edit-creditUnits"
                    name="creditUnits"
                    type="number"
                    min="1"
                    defaultValue={editingCourse.creditUnits}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level *</Label>
                  <Input
                    id="edit-level"
                    name="level"
                    type="number"
                    min="100"
                    max="900"
                    step="100"
                    defaultValue={editingCourse.level}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-semester">Semester *</Label>
                  <select
                    id="edit-semester"
                    name="semester"
                    defaultValue={editingCourse.semester}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-academicYear">Academic Year *</Label>
                  <Input
                    id="edit-academicYear"
                    name="academicYear"
                    defaultValue={editingCourse.academicYear}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-departmentId">Department *</Label>
                  <select
                    id="edit-departmentId"
                    name="departmentId"
                    defaultValue={editingCourse.department.id}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lecturerId">Lecturer</Label>
                  <select
                    id="edit-lecturerId"
                    name="lecturerId"
                    defaultValue={editingCourse.lecturer?.id || ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.firstName} {lecturer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-maxStudents">Max Students</Label>
                  <Input
                    id="edit-maxStudents"
                    name="maxStudents"
                    type="number"
                    min="1"
                    defaultValue={editingCourse.maxStudents || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-isActive">Status</Label>
                  <select
                    id="edit-isActive"
                    name="isActive"
                    defaultValue={editingCourse.isActive ? "true" : "false"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Update Course"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


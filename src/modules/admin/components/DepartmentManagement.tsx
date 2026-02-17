"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDepartment, updateDepartment, deleteDepartment } from "@/modules/admin/actions/departmentActions"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
  description: string | null
  stats: {
    courses: number
    students: number
    lecturers: number
    workers: number
    totalSalary: number
  }
}

interface DepartmentManagementProps {
  departments: Department[]
}

export function DepartmentManagement({ departments }: DepartmentManagementProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await createDepartment({
          name: formData.get("name") as string,
          description: formData.get("description") as string || null,
          studentCount: Number(formData.get("studentCount")) || 0,
          courseCount: Number(formData.get("courseCount")) || 0,
          lecturerCount: Number(formData.get("lecturerCount")) || 0,
          staffCount: Number(formData.get("staffCount")) || 0,
          totalSalary: Number(formData.get("totalSalary")) || 0,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Department created successfully!" })
          setIsCreating(false)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to create department" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingDept) return

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await updateDepartment(editingDept.id, {
          name: formData.get("name") as string,
          description: formData.get("description") as string || null,
          studentCount: Number(formData.get("studentCount")) || 0,
          courseCount: Number(formData.get("courseCount")) || 0,
          lecturerCount: Number(formData.get("lecturerCount")) || 0,
          staffCount: Number(formData.get("staffCount")) || 0,
          totalSalary: Number(formData.get("totalSalary")) || 0,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Department updated successfully!" })
          setEditingDept(null)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update department" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleDelete = async (deptId: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    startTransition(async () => {
      try {
        const result = await deleteDepartment(deptId)
        if (result.success) {
          setMessage({ type: "success", text: "Department deleted successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete department" })
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
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Department
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Department</CardTitle>
            <CardDescription>Add a new department to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input id="name" name="name" required />
                <p className="text-xs text-muted-foreground">
                  A unique department code will be generated automatically.
                </p>
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
                  <Label htmlFor="studentCount">Students (approx)</Label>
                  <Input id="studentCount" name="studentCount" type="number" defaultValue="0" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCount">Courses (approx)</Label>
                  <Input id="courseCount" name="courseCount" type="number" defaultValue="0" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturerCount">Lecturers</Label>
                  <Input id="lecturerCount" name="lecturerCount" type="number" defaultValue="0" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffCount">Other Staff</Label>
                  <Input id="staffCount" name="staffCount" type="number" defaultValue="0" min="0" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="totalSalary">Total Salary Allocation ($)</Label>
                  <Input id="totalSalary" name="totalSalary" type="number" defaultValue="0" min="0" step="0.01" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>Manage departments in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">Code: {dept.code}</p>
                  {dept.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{dept.description}</p>
                  )}
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>{dept.stats.courses} courses • {dept.stats.students} students</p>
                    <p>
                      {dept.stats.lecturers} lecturers • {dept.stats.workers} other staff
                    </p>
                    <p className="font-medium text-foreground">
                      Total Salary: {formatCurrency(dept.stats.totalSalary)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDept(dept)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(dept.id)}
                    disabled={
                      isPending ||
                      dept.stats.courses > 0 ||
                      dept.stats.students > 0 ||
                      dept.stats.lecturers > 0
                    }
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
      {editingDept && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Department</CardTitle>
            <CardDescription>Update department information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Department Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingDept.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department Code</Label>
                  <p className="rounded-md border bg-muted px-3 py-2 text-sm font-mono">
                    {editingDept.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Codes are auto-generated and stay fixed after creation.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingDept.description || ""}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-studentCount">Students (approx)</Label>
                  <Input
                    id="edit-studentCount"
                    name="studentCount"
                    type="number"
                    defaultValue={editingDept.stats.students}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-courseCount">Courses (approx)</Label>
                  <Input
                    id="edit-courseCount"
                    name="courseCount"
                    type="number"
                    defaultValue={editingDept.stats.courses}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lecturerCount">Lecturers</Label>
                  <Input
                    id="edit-lecturerCount"
                    name="lecturerCount"
                    type="number"
                    defaultValue={editingDept.stats.lecturers}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-staffCount">Other Staff</Label>
                  <Input
                    id="edit-staffCount"
                    name="staffCount"
                    type="number"
                    defaultValue={editingDept.stats.workers}
                    min="0"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-totalSalary">Total Salary Allocation ($)</Label>
                  <Input
                    id="edit-totalSalary"
                    name="totalSalary"
                    type="number"
                    defaultValue={editingDept.stats.totalSalary}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Update"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingDept(null)}>
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





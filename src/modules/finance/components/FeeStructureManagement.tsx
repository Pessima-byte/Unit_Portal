"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFeeStructure, updateFeeStructure, deleteFeeStructure } from "@/modules/finance/actions/feeActions"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
}

interface FeeStructure {
  id: string
  name: string
  description: string | null
  amount: number
  academicYear: string
  semester: string | null
  level: number | null
  dueDate: Date | null
  isActive: boolean
  department: Department | null
  _count: {
    payments: number
  }
}

interface FeeStructureManagementProps {
  feeStructures: FeeStructure[]
  departments: Department[]
}

export function FeeStructureManagement({
  feeStructures,
  departments,
}: FeeStructureManagementProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await createFeeStructure({
          name: formData.get("name") as string,
          description: formData.get("description") as string || null,
          amount: parseFloat(formData.get("amount") as string),
          academicYear: formData.get("academicYear") as string,
          semester: formData.get("semester") as string || null,
          level: formData.get("level") ? parseInt(formData.get("level") as string) : null,
          dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
          departmentId: formData.get("departmentId") as string || null,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Fee structure created successfully!" })
          setIsCreating(false)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to create fee structure" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingFee) return

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await updateFeeStructure(editingFee.id, {
          name: formData.get("name") as string,
          description: formData.get("description") as string || null,
          amount: parseFloat(formData.get("amount") as string),
          academicYear: formData.get("academicYear") as string,
          semester: formData.get("semester") as string || null,
          level: formData.get("level") ? parseInt(formData.get("level") as string) : null,
          dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
          departmentId: formData.get("departmentId") as string || null,
          isActive: formData.get("isActive") === "true",
        })

        if (result.success) {
          setMessage({ type: "success", text: "Fee structure updated successfully!" })
          setEditingFee(null)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update fee structure" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleDelete = async (feeId: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return

    startTransition(async () => {
      try {
        const result = await deleteFeeStructure(feeId)
        if (result.success) {
          setMessage({ type: "success", text: "Fee structure deleted successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete fee structure" })
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

      <div className="flex justify-end">
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Fee Structure
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Fee Structure</CardTitle>
            <CardDescription>Add a new fee structure to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fee Name *</Label>
                <Input id="name" name="name" required />
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
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
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
                  <Label htmlFor="semester">Semester</Label>
                  <select
                    id="semester"
                    name="semester"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All semesters</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    min="100"
                    max="900"
                    step="100"
                    placeholder="Leave empty for all levels"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                  />
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

      {/* Fee Structures List */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>Manage fee structures in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeStructures.map((fee) => (
              <div
                key={fee.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{fee.name}</h3>
                    {!fee.isActive && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${fee.amount.toFixed(2)} • {fee.academicYear}
                    {fee.semester && ` • ${fee.semester}`}
                  </p>
                  {fee.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{fee.description}</p>
                  )}
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {fee.department && <p>Department: {fee.department.name}</p>}
                    {fee.level && <p>Level: {fee.level}</p>}
                    {fee.dueDate && (
                      <p>Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
                    )}
                    <p>{fee._count.payments} payments</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFee(fee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(fee.id)}
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
      {editingFee && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Fee Structure</CardTitle>
            <CardDescription>Update fee structure information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Fee Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingFee.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingFee.description || ""}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount *</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingFee.amount}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-academicYear">Academic Year *</Label>
                  <Input
                    id="edit-academicYear"
                    name="academicYear"
                    defaultValue={editingFee.academicYear}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-semester">Semester</Label>
                  <select
                    id="edit-semester"
                    name="semester"
                    defaultValue={editingFee.semester || ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All semesters</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Input
                    id="edit-level"
                    name="level"
                    type="number"
                    min="100"
                    max="900"
                    step="100"
                    defaultValue={editingFee.level || ""}
                    placeholder="Leave empty for all levels"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-departmentId">Department</Label>
                  <select
                    id="edit-departmentId"
                    name="departmentId"
                    defaultValue={editingFee.department?.id || ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={
                      editingFee.dueDate
                        ? new Date(editingFee.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Status</Label>
                <select
                  id="edit-isActive"
                  name="isActive"
                  defaultValue={editingFee.isActive ? "true" : "false"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Update"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingFee(null)}>
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





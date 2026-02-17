"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUser, updateUser, deleteUser } from "@/modules/admin/actions/userActions"
import { UserRole } from "@prisma/client"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  studentId: string | null
  phone: string | null
  isActive: boolean
  department: Department | null
  enrollments?: Array<{ id: string }>
  courses?: Array<{ id: string }>
}

interface UserManagementProps {
  users: User[]
  userType: "STUDENT" | "LECTURER"
  departments: Department[]
}

export function UserManagement({ users, userType, departments }: UserManagementProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await createUser({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          role: userType,
          phone: formData.get("phone") as string || null,
          departmentId: formData.get("departmentId") as string || null,
        })

        if (result.success) {
          setMessage({ type: "success", text: "User created successfully!" })
          setIsCreating(false)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to create user" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await updateUser(editingUser.id, {
          email: formData.get("email") as string,
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          phone: formData.get("phone") as string || null,
          departmentId: formData.get("departmentId") as string || null,
          isActive: formData.get("isActive") === "true",
        })

        if (result.success) {
          setMessage({ type: "success", text: "User updated successfully!" })
          setEditingUser(null)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update user" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    startTransition(async () => {
      try {
        const result = await deleteUser(userId)
        if (result.success) {
          setMessage({ type: "success", text: "User deleted successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete user" })
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
          Add {userType}
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New {userType}</CardTitle>
            <CardDescription>Add a new {userType.toLowerCase()} to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              {userType === "STUDENT" && (
                <p className="text-sm text-muted-foreground">
                  Student ID will be generated automatically.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <select
                  id="departmentId"
                  name="departmentId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
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

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>{userType}s</CardTitle>
          <CardDescription>List of all {userType.toLowerCase()}s</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    {!user.isActive && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.studentId && (
                    <p className="text-xs text-muted-foreground">ID: {user.studentId}</p>
                  )}
                  {user.department && (
                    <p className="text-xs text-muted-foreground">
                      Department: {user.department.name}
                    </p>
                  )}
                  {userType === "STUDENT" && user.enrollments && (
                    <p className="text-xs text-muted-foreground">
                      {user.enrollments.length} active enrollments
                    </p>
                  )}
                  {userType === "LECTURER" && user.courses && (
                    <p className="text-xs text-muted-foreground">
                      {user.courses.length} courses
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
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

      {/* Edit Form Modal */}
      {editingUser && (
        <Card>
          <CardHeader>
            <CardTitle>Edit {userType}</CardTitle>
            <CardDescription>Update user information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    defaultValue={editingUser.firstName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    defaultValue={editingUser.lastName}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  required
                />
              </div>

              {userType === "STUDENT" && editingUser.studentId && (
                <p className="text-sm text-muted-foreground">
                  Student ID: <span className="font-mono">{editingUser.studentId}</span>
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  defaultValue={editingUser.phone || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-departmentId">Department</Label>
                <select
                  id="edit-departmentId"
                  name="departmentId"
                  defaultValue={editingUser.department?.id || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                <Label htmlFor="edit-isActive">Status</Label>
                <select
                  id="edit-isActive"
                  name="isActive"
                  defaultValue={editingUser.isActive ? "true" : "false"}
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
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
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





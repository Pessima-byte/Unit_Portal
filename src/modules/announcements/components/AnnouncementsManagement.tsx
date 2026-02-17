"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, publishAnnouncement } from "@/modules/announcements/actions/announcementActions"
import { Plus, Edit, Trash2, Send, Users } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  targetRole: string | null
  isPublished: boolean
  publishedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
  createdBy: {
    firstName: string
    lastName: string
  }
  _count: {
    notifications: number
  }
}

interface AnnouncementsManagementProps {
  announcements: Announcement[]
}

export function AnnouncementsManagement({ announcements }: AnnouncementsManagementProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await createAnnouncement({
          title: formData.get("title") as string,
          content: formData.get("content") as string,
          type: formData.get("type") as string,
          targetRole: formData.get("targetRole") as string || null,
          expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Announcement created successfully!" })
          setIsCreating(false)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to create announcement" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingAnnouncement) return

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await updateAnnouncement(editingAnnouncement.id, {
          title: formData.get("title") as string,
          content: formData.get("content") as string,
          type: formData.get("type") as string,
          targetRole: formData.get("targetRole") as string || null,
          expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null,
        })

        if (result.success) {
          setMessage({ type: "success", text: "Announcement updated successfully!" })
          setEditingAnnouncement(null)
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update announcement" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handleDelete = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    startTransition(async () => {
      try {
        const result = await deleteAnnouncement(announcementId)
        if (result.success) {
          setMessage({ type: "success", text: "Announcement deleted successfully!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete announcement" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  const handlePublish = async (announcementId: string) => {
    startTransition(async () => {
      try {
        const result = await publishAnnouncement(announcementId)
        if (result.success) {
          setMessage({ type: "success", text: "Announcement published and notifications sent!" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to publish announcement" })
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
          Create Announcement
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
            <CardDescription>Create an announcement for the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <textarea
                  id="content"
                  name="content"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Audience</Label>
                  <select
                    id="targetRole"
                    name="targetRole"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Users</option>
                    <option value="STUDENT">Students</option>
                    <option value="LECTURER">Lecturers</option>
                    <option value="ADMIN">Admins</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires At (optional)</Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                />
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

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>Manage announcements in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    {announcement.isPublished ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                        Draft
                      </span>
                    )}
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {announcement.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>
                      Created by: {announcement.createdBy.firstName}{" "}
                      {announcement.createdBy.lastName} •{" "}
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                    {announcement.targetRole && (
                      <p>Target: {announcement.targetRole}</p>
                    )}
                    {announcement.publishedAt && (
                      <p>Published: {new Date(announcement.publishedAt).toLocaleString()}</p>
                    )}
                    {announcement.expiresAt && (
                      <p>
                        Expires: {new Date(announcement.expiresAt).toLocaleString()}
                      </p>
                    )}
                    <p>{announcement._count.notifications} notifications sent</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!announcement.isPublished && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePublish(announcement.id)}
                      disabled={isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAnnouncement(announcement)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
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
      {editingAnnouncement && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Announcement</CardTitle>
            <CardDescription>Update announcement information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingAnnouncement.title}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Content *</Label>
                <textarea
                  id="edit-content"
                  name="content"
                  defaultValue={editingAnnouncement.content}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type *</Label>
                  <select
                    id="edit-type"
                    name="type"
                    defaultValue={editingAnnouncement.type}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-targetRole">Target Audience</Label>
                  <select
                    id="edit-targetRole"
                    name="targetRole"
                    defaultValue={editingAnnouncement.targetRole || ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Users</option>
                    <option value="STUDENT">Students</option>
                    <option value="LECTURER">Lecturers</option>
                    <option value="ADMIN">Admins</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expiresAt">Expires At (optional)</Label>
                <Input
                  id="edit-expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  defaultValue={
                    editingAnnouncement.expiresAt
                      ? new Date(editingAnnouncement.expiresAt).toISOString().slice(0, 16)
                      : ""
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Update"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingAnnouncement(null)}>
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



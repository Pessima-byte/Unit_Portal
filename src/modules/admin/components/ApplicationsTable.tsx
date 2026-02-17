"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { approveApplication, rejectApplication } from "@/modules/admin/actions/applicationActions"

// Define simplified type for prop
interface Application {
    id: string
    firstName: string
    lastName: string
    email: string
    createdAt: Date
    appliedCourse: {
        id: string
        name: string
        code: string
    } | null
}

interface ApplicationsTableProps {
    applications: Application[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleApprove = async (id: string) => {
        startTransition(async () => {
            const result = await approveApplication(id)
            if (result.success) {
                // Success handling (toast or refresh)
                router.refresh()
            } else {
                alert(result.error || "Failed to approve application")
            }
        })
    }

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this application? This cannot be undone.")) return

        startTransition(async () => {
            const result = await rejectApplication(id)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || "Failed to reject application")
            }
        })
    }

    if (applications.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No pending applications found.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Review and manage student applications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Applicant Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Applied Course</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-b">
                            {applications.map((app) => (
                                <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        {app.firstName} {app.lastName}
                                    </td>
                                    <td className="px-4 py-3">{app.email}</td>
                                    <td className="px-4 py-3">
                                        {app.appliedCourse ? (
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {app.appliedCourse.code}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">None</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(app.id)}
                                            disabled={isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReject(app.id)}
                                            disabled={isPending}
                                        >
                                            Reject
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

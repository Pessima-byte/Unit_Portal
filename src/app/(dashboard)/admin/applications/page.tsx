import { getPendingApplications } from "@/modules/admin/actions/applicationActions"
import { ApplicationsTable } from "@/modules/admin/components/ApplicationsTable"
import { ClipboardList } from "lucide-react"

export default async function ApplicationsPage() {
    const { applications, error } = await getPendingApplications()

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-destructive">
                <p>Error loading applications: {error}</p>
            </div>
        )
    }

    // Need to map the data to match the component's expected structure if needed
    // Since Prisma date is Date object and component expects Date, it should be fine.
    // However, appliedCourse might be typed differently in Prisma than our simple interface.
    // Let's ensure compatibility.

    const formattedApplications = applications?.map(app => ({
        id: app.id,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        createdAt: app.createdAt instanceof Date ? app.createdAt : new Date(app.createdAt),
        appliedCourse: app.appliedCourse ? {
            id: app.appliedCourse.id,
            name: app.appliedCourse.name,
            code: app.appliedCourse.code
        } : null
    })) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <ClipboardList className="h-5 w-5" />
                    <span>Review incoming student applications</span>
                </div>
            </div>

            <ApplicationsTable applications={formattedApplications} />
        </div>
    )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AnnouncementsManagement } from "@/modules/announcements/components/AnnouncementsManagement"

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null
  }

  // Fetch all announcements
  const announcements = await db.announcement.findMany({
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          notifications: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">Create and manage announcements</p>
      </div>

      <AnnouncementsManagement announcements={announcements} />
    </div>
  )
}





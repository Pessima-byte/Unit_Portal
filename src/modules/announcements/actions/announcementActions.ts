"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"
import { sendAnnouncementEmail } from "@/lib/email"
import { sendAnnouncementSMS } from "@/lib/sms"

interface AnnouncementData {
  title: string
  content: string
  type: string
  targetRole: string | null
  expiresAt: Date | null
}

export async function createAnnouncement(data: AnnouncementData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await db.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        targetRole: data.targetRole as UserRole | null,
        expiresAt: data.expiresAt,
        createdById: session.user.id,
      },
    })

    revalidatePath("/admin/announcements")
    return { success: true }
  } catch (error) {
    console.error("Error creating announcement:", error)
    return { success: false, error: "Failed to create announcement" }
  }
}

export async function updateAnnouncement(announcementId: string, data: AnnouncementData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await db.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        targetRole: data.targetRole as UserRole | null,
        expiresAt: data.expiresAt,
      },
    })

    revalidatePath("/admin/announcements")
    return { success: true }
  } catch (error) {
    console.error("Error updating announcement:", error)
    return { success: false, error: "Failed to update announcement" }
  }
}

export async function deleteAnnouncement(announcementId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await db.announcement.delete({
      where: { id: announcementId },
    })

    revalidatePath("/admin/announcements")
    return { success: true }
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return { success: false, error: "Failed to delete announcement" }
  }
}

export async function publishAnnouncement(announcementId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const announcement = await db.announcement.findUnique({
      where: { id: announcementId },
    })

    if (!announcement) {
      return { success: false, error: "Announcement not found" }
    }

    // Update announcement status
    await db.announcement.update({
      where: { id: announcementId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    })

    // Create notifications for target users
    const targetRole = announcement.targetRole
    const users = await db.user.findMany({
      where: {
        isActive: true,
        ...(targetRole && { role: targetRole as UserRole }),
      },
      select: { id: true },
    })

    // Create in-app notifications
    await db.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        announcementId: announcementId,
        title: announcement.title,
        message: announcement.content.substring(0, 200),
        type: "IN_APP",
        status: "PENDING",
      })),
    })

    // Send email notifications
    const usersWithEmail = await db.user.findMany({
      where: {
        id: { in: users.map((u) => u.id) },
        isActive: true,
      },
      select: { id: true, email: true },
    })

    // Send emails in background (don't await to avoid blocking)
    Promise.all(
      usersWithEmail.map((user) =>
        sendAnnouncementEmail(user.email, {
          title: announcement.title,
          content: announcement.content,
          type: announcement.type,
        }).then((result) => {
          // Update notification status if email sent
          if (result.success) {
            db.notification.updateMany({
              where: {
                userId: user.id,
                announcementId: announcementId,
                type: "EMAIL",
              },
              data: { status: "SENT", sentAt: new Date() },
            })
          }
        })
      )
    ).catch((error) => {
      console.error("Error sending announcement emails:", error)
    })

    // Create email notification records
    await db.notification.createMany({
      data: usersWithEmail.map((user) => ({
        userId: user.id,
        announcementId: announcementId,
        title: announcement.title,
        message: announcement.content.substring(0, 200),
        type: "EMAIL",
        status: "PENDING",
      })),
    })

    // Send SMS notifications (for users with phone numbers)
    const usersWithPhone = await db.user.findMany({
      where: {
        id: { in: users.map((u) => u.id) },
        isActive: true,
        phone: { not: null },
      },
      select: { id: true, phone: true },
    })

    // Send SMS in background
    Promise.all(
      usersWithPhone
        .filter((user) => user.phone)
        .map((user) =>
          sendAnnouncementSMS(user.phone!, {
            title: announcement.title,
            content: announcement.content,
          }).then((result) => {
            // Update notification status if SMS sent
            if (result.success) {
              db.notification.updateMany({
                where: {
                  userId: user.id,
                  announcementId: announcementId,
                  type: "SMS",
                },
                data: { status: "SENT", sentAt: new Date() },
              })
            }
          })
        )
    ).catch((error) => {
      console.error("Error sending announcement SMS:", error)
    })

    // Create SMS notification records
    await db.notification.createMany({
      data: usersWithPhone
        .filter((user) => user.phone)
        .map((user) => ({
          userId: user.id,
          announcementId: announcementId,
          title: announcement.title,
          message: announcement.content.substring(0, 200),
          type: "SMS",
          status: "PENDING",
        })),
    })

    revalidatePath("/admin/announcements")
    return { success: true }
  } catch (error) {
    console.error("Error publishing announcement:", error)
    return { success: false, error: "Failed to publish announcement" }
  }
}



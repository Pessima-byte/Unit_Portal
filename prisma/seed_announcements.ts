import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    })

    if (!admin) {
        console.error("No admin user found. Please run seed_data.ts first or create an admin.")
        return
    }

    const announcements = [
        {
            title: "Fall Semester Registration Open",
            content: "Registration for the upcoming Fall Semester is now open. All students are advised to complete their course selection by the end of the month. Visit the student portal for more details.",
            type: "ACADEMIC",
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id
        },
        {
            title: "Campus Maintenance Scheduled",
            content: "Please be aware that routine maintenance is scheduled for the main library building this weekend. Access may be limited during this time.",
            type: "URGENT",
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id
        },
        {
            title: "University Ranking Improvement",
            content: "We are proud to announce that our university has moved up 10 places in the global rankings. This is a testament to the hard work of our faculty and students.",
            type: "GENERAL",
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id
        }
    ]

    for (const ann of announcements) {
        // Check if exists to avoid duplicates if run multiple times (optional but good practice)
        const existing = await prisma.announcement.findFirst({
            where: { title: ann.title }
        })

        if (!existing) {
            await prisma.announcement.create({
                data: ann
            })
            console.log(`Created announcement: ${ann.title}`)
        } else {
            console.log(`Skipped existing: ${ann.title}`)
        }
    }

    console.log('Announcements seeded successfully.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

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

    const fbc = await prisma.college.findUnique({ where: { slug: 'fbc' } })
    const ipam = await prisma.college.findUnique({ where: { slug: 'ipam' } })
    const comahs = await prisma.college.findUnique({ where: { slug: 'comahs' } })

    const announcements = [
        {
            title: "College C Annual Founder's Day",
            content: "Join us this Friday at College C for the celebration of our historic legacy. Refreshments will be provided.",
            type: "GENERAL",
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id,
            collegeId: fbc?.id
        },
        {
            title: "College B Business Seminar",
            content: "A guest lecture from the Central Bank Governor will take place in the College B main auditorium. Mandatory for Final Year students.",
            type: "ACADEMIC",
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id,
            collegeId: ipam?.id
        },
        {
            title: "College A Lab Maintenance",
            content: "College A Surgery lab 2 will be closed for sterilization and equipment upgrade. Please use Lab 3 for practicals.",
            type: "URGENT",
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id,
            collegeId: comahs?.id
        },
        {
            title: "Joint Convocation Ceremony",
            content: "All colleges are informed that the joint convocation ceremony is scheduled for the end of the semester.",
            type: "GENERAL",
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id,
            collegeId: null // Global
        }
    ]

    for (const ann of announcements) {
        await prisma.announcement.upsert({
            where: { id: (await prisma.announcement.findFirst({ where: { content: ann.content } }))?.id || 'new' },
            create: ann,
            update: ann,
        })
        console.log(`Processed announcement: ${ann.title}`)
    }

    console.log('College-specific announcements seeded successfully.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

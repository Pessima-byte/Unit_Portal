import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding colleges...')

    const colleges = [
        {
            name: 'College A',
            slug: 'comahs',
            description: 'Premier medical and health sciences institution.',
            address: 'New England, Freetown',
            website: 'https://comahs.usl.edu.sl',
            email: 'info@comahs.usl.edu.sl',
        },
        {
            name: 'College B',
            slug: 'ipam',
            description: 'Leading institution for management and technology.',
            address: 'Tower Hill, Freetown',
            website: 'https://ipam.usl.edu.sl',
            email: 'info@ipam.usl.edu.sl',
        },
        {
            name: 'College C',
            slug: 'fbc',
            description: 'Historic institution for arts, sciences, and law.',
            address: 'Mount Aureol, Freetown',
            website: 'https://fbc.usl.edu.sl',
            email: 'info@fbc.usl.edu.sl',
        },
    ]

    for (const college of colleges) {
        await prisma.college.upsert({
            where: { slug: college.slug },
            update: {
                name: college.name,
                description: college.description,
            },
            create: college,
        })
        console.log(`Processed college: ${college.name}`)
    }

    console.log('College seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create Departments
    const cse = await prisma.department.create({
        data: {
            name: 'Computer Science & Engineering',
            code: 'CSE',
            description: 'Department of Computer Science',
        },
    })

    const med = await prisma.department.create({
        data: {
            name: 'Medicine & Surgery',
            code: 'MED',
            description: 'Department of Medicine',
        },
    })

    // Create Courses
    // Create Courses
    await prisma.course.create({
        data: {
            name: 'Introduction to Computer Science',
            code: 'CSC101',
            creditUnits: 3,
            level: 100,
            type: 'UNDERGRADUATE',
            requirements: ['High School Diploma', 'Credit in Mathematics'],
            semester: 'First',
            academicYear: '2025/2026',
            departmentId: cse.id,
        },
    })

    await prisma.course.create({
        data: {
            name: 'Data Structures and Algorithms',
            code: 'CSC201',
            creditUnits: 4,
            level: 200,
            type: 'UNDERGRADUATE',
            requirements: ['CSC101', 'Credit in Mathematics'],
            semester: 'First',
            academicYear: '2025/2026',
            departmentId: cse.id,
        },
    })

    await prisma.course.create({
        data: {
            name: 'Anatomy & Physiology I',
            code: 'MED101',
            creditUnits: 4,
            level: 100,
            type: 'UNDERGRADUATE',
            requirements: ['High School Diploma in Science', 'Credit in Biology'],
            semester: 'First',
            academicYear: '2025/2026',
            departmentId: med.id,
        },
    })

    await prisma.course.create({
        data: {
            name: 'Advanced Software Engineering',
            code: 'CSC701',
            creditUnits: 4,
            level: 700,
            type: 'POSTGRADUATE',
            requirements: ['BSc in Computer Science', 'Interview'],
            semester: 'First',
            academicYear: '2025/2026',
            departmentId: cse.id,
        },
    })

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10)

    await prisma.user.create({
        data: {
            email: 'admin@university.edu',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin',
            role: 'ADMIN',
            isActive: true,
        },
    })

    console.log('Seeding completed.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

# University Portal

A comprehensive, modular university management portal built with Next.js 14+, TypeScript, PostgreSQL, and NextAuth.js.

## Features

- 🎓 Student Module - Course registration, timetable, grades, payments
- 👨‍🏫 Lecturer Module - Course materials, assignments, grading, attendance
- 🏫 Admin Module - User management, course creation, system settings
- 💰 Finance Module - Fee management, payments, receipts
- 📚 Course Management - Prerequisites, allocation, credit units
- 📰 Announcements & Notifications - Email/SMS notifications
- 🛡️ Authentication & Authorization - Role-based access control

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database URL and other configuration.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed architecture and implementation plan.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Development

This project follows a modular architecture. Each feature is organized as a separate module in `src/modules/`.

Refer to the [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed implementation guidelines.





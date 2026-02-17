# University Portal Development Plan

## Technology Stack

- **Next.js 14+** with App Router (Server Components, Server Actions)
- **TypeScript** for type safety
- **PostgreSQL** with **Prisma ORM** for database
- **NextAuth.js** for authentication and authorization
- **Tailwind CSS** + **shadcn/ui** for UI components
- **Zod** for schema validation

## Project Structure (Modular Architecture)

```
Uni_Portal/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── student/       # Student module routes
│   │   │   ├── lecturer/      # Lecturer module routes
│   │   │   ├── admin/         # Admin module routes
│   │   │   └── finance/       # Finance module routes
│   │   └── api/               # API routes
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── student/           # Student Module
│   │   ├── lecturer/          # Lecturer Module
│   │   ├── admin/             # Admin Module
│   │   ├── finance/           # Finance/Bursary Module
│   │   ├── course/            # Course Management Module
│   │   └── announcements/     # Announcements & Notifications
│   ├── components/            # Shared UI components
│   │   ├── ui/                # shadcn/ui components
│   │   └── shared/            # Custom shared components
│   ├── lib/                   # Utilities and configurations
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client
│   │   ├── utils.ts           # Helper functions
│   │   └── validations/       # Zod schemas
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── package.json
```

## Database Schema (Prisma)

The Prisma schema will include models for:

- **User** (with roles: STUDENT, LECTURER, ADMIN, FINANCE)
- **Department**
- **Course** (with prerequisites, credit units)
- **CourseEnrollment**
- **Assignment**
- **Grade**
- **Attendance**
- **FeeStructure**
- **Payment**
- **Announcement**
- **Notification**

## Module Implementation Details

### 1. Authentication & Authorization Module

**Features:**
- NextAuth.js setup with credentials provider
- Role-based access control (RBAC)
- Protected route middleware
- Session management
- Password hashing with bcrypt

**Key Files:**
- `src/lib/auth.ts` - NextAuth configuration
- `src/middleware.ts` - Route protection
- `src/app/api/auth/[...nextauth]/route.ts` - Auth handler
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/register/page.tsx` - Register page

### 2. Student Module

**Features:**
- Student dashboard
- Course registration interface
- Timetable view (calendar component)
- Grades viewing
- Fee payment integration
- Results/transcripts download

**Key Files:**
- `src/app/(dashboard)/student/page.tsx` - Student dashboard
- `src/app/(dashboard)/student/courses/page.tsx` - Course registration
- `src/app/(dashboard)/student/timetable/page.tsx` - Timetable view
- `src/app/(dashboard)/student/grades/page.tsx` - Grades view
- `src/app/(dashboard)/student/payments/page.tsx` - Fee payment
- `src/app/(dashboard)/student/transcripts/page.tsx` - Transcripts
- `src/modules/student/` - Student-specific components and logic

### 3. Lecturer Module

**Features:**
- Lecturer dashboard
- Course material upload (file handling)
- Assignment creation and management
- Student grading interface
- Attendance management
- Course roster view

**Key Files:**
- `src/app/(dashboard)/lecturer/page.tsx` - Lecturer dashboard
- `src/app/(dashboard)/lecturer/materials/page.tsx` - Course materials
- `src/app/(dashboard)/lecturer/assignments/page.tsx` - Assignment management
- `src/app/(dashboard)/lecturer/grading/page.tsx` - Grading interface
- `src/app/(dashboard)/lecturer/attendance/page.tsx` - Attendance management
- `src/modules/lecturer/` - Lecturer-specific components and logic

### 4. Admin Module

**Features:**
- Admin dashboard with analytics
- Course creation and management
- Department management
- Student/Lecturer management (CRUD)
- Results approval workflow
- Portal settings configuration

**Key Files:**
- `src/app/(dashboard)/admin/page.tsx` - Admin dashboard
- `src/app/(dashboard)/admin/courses/page.tsx` - Course management
- `src/app/(dashboard)/admin/departments/page.tsx` - Department management
- `src/app/(dashboard)/admin/students/page.tsx` - Student management
- `src/app/(dashboard)/admin/lecturers/page.tsx` - Lecturer management
- `src/app/(dashboard)/admin/results/page.tsx` - Results approval
- `src/app/(dashboard)/admin/settings/page.tsx` - Portal settings
- `src/modules/admin/` - Admin-specific components and logic

### 5. Finance/Bursary Module

**Features:**
- Fee structure management
- Payment processing (payment gateway integration)
- Receipt generation (PDF)
- Outstanding balance tracking
- Payment history

**Key Files:**
- `src/app/(dashboard)/finance/page.tsx` - Finance dashboard
- `src/app/(dashboard)/finance/fees/page.tsx` - Fee structure management
- `src/app/(dashboard)/finance/payments/page.tsx` - Payment processing
- `src/app/(dashboard)/finance/receipts/page.tsx` - Receipt generation
- `src/modules/finance/` - Finance-specific components and logic

### 6. Course Management Module

**Features:**
- Course creation with prerequisites
- Course allocation to lecturers
- Credit unit calculation
- Prerequisites validation
- Course catalog

**Key Files:**
- `src/modules/course/` - Course management logic
- `src/app/api/courses/` - Course API endpoints
- `src/lib/validations/course.ts` - Course validation schemas

### 7. Announcements & Notification Module

**Features:**
- Announcement creation and management
- Email notifications (Nodemailer/Resend)
- SMS notifications (optional, Twilio)
- In-app notifications
- Notification preferences

**Key Files:**
- `src/modules/announcements/` - Announcements logic
- `src/app/api/announcements/` - Announcement API endpoints
- `src/components/shared/NotificationCenter.tsx` - Notification UI

## Implementation Phases

### Phase 1: Foundation
- [ ] Project setup (Next.js, TypeScript, Prisma)
- [ ] Database schema design and migration
- [ ] Authentication module implementation
- [ ] Basic UI setup (Tailwind, shadcn/ui)
- [ ] Environment variables configuration

### Phase 2: Core Modules
- [ ] Student module (dashboard, course registration, grades)
- [ ] Lecturer module (materials, assignments, grading)
- [ ] Admin module (user management, course creation)

### Phase 3: Advanced Features
- [ ] Finance module (payments, receipts)
- [ ] Course management (prerequisites, allocation)
- [ ] Announcements and notifications

### Phase 4: Polish & Security
- [ ] Role-based access control refinement
- [ ] Input validation and sanitization
- [ ] Error handling and logging
- [ ] Performance optimization
- [ ] Testing

## Key Implementation Files

### Database & Configuration
- `prisma/schema.prisma` - Complete database schema
- `src/lib/db.ts` - Prisma client singleton
- `src/lib/auth.ts` - NextAuth configuration
- `.env.example` - Environment variables template

### Core Module Files
- `src/modules/auth/` - Authentication logic
- `src/modules/student/` - Student-specific components and logic
- `src/modules/lecturer/` - Lecturer-specific components and logic
- `src/modules/admin/` - Admin-specific components and logic
- `src/modules/finance/` - Finance-specific components and logic
- `src/modules/course/` - Course management logic
- `src/modules/announcements/` - Announcements logic

### API Routes
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/api/students/` - Student API endpoints
- `src/app/api/courses/` - Course API endpoints
- `src/app/api/grades/` - Grade API endpoints
- `src/app/api/payments/` - Payment API endpoints
- `src/app/api/announcements/` - Announcement API endpoints
- `src/app/api/upload/` - File upload endpoints

### UI Components
- Dashboard layouts for each role
- Data tables for management interfaces
- Forms for data entry
- File upload components
- Calendar/timetable component
- Notification system UI

### Middleware & Utilities
- `src/middleware.ts` - Route protection
- `src/lib/permissions.ts` - Permission checking utilities
- `src/lib/validations/` - Zod schemas for all forms

## Technical Considerations

- **Server Actions** for form submissions and mutations
- **Server Components** for data fetching
- **Client Components** only when needed (interactivity)
- **File uploads** using Next.js API routes with proper validation
- **Email service** integration for notifications (Resend recommended)
- **Payment gateway** integration (Stripe/Paystack)
- **PDF generation** for receipts and transcripts (react-pdf or pdfkit)
- **Calendar library** for timetable display (react-big-calendar or fullcalendar)
- **Data tables** with sorting, filtering, pagination (tanstack-table)
- **Form handling** with react-hook-form and Zod validation

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/university_portal"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (for notifications)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@university.edu"

# Payment Gateway (optional)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# SMS (optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
```

## Notes

- Always follow the modular architecture - each feature should be self-contained in its module
- Use TypeScript strictly - avoid `any` types
- Implement proper error handling and user feedback
- Ensure all forms have proper validation
- Follow Next.js 14+ best practices (Server Components by default)
- Use shadcn/ui components for consistent UI
- Implement proper loading states and error boundaries
- Ensure responsive design for mobile devices


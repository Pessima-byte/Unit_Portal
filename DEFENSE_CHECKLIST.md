# University Portal: Dissertation Defense Study Checklist

This document serves as a comprehensive structured list of knowledge areas required to confidently defend the University Portal project.

---

## 1️⃣ Project Fundamentals
*   **Project Objective:** Automated management of university academic, financial, and administrative operations through a centralized portal.
*   **Problem Statement:** Manual processing of course registrations, grading, and fee payments leading to inefficiency, delayed results, and data inconsistency.
*   **Target Users:** Students, Lecturers, Administrators, and Finance/Bursary staff.
*   **Scope of the System:** Secure authentication, Course management, Automated grade recording, Fee tracking, and Internal system notifications.
*   **Key Assumptions:** Users have basic digital literacy; consistent internet connectivity for real-time database updates; administrative staff provides accurate foundational data (departments/courses).
*   **Constraints:** Role-based access (RBAC) restricted to four categories; no support for offline data entry.

---

## 2️⃣ System Architecture
*   **Architecture Pattern:** Modular Architecture using Next.js 14 App Router.
*   **System Components:**
    *   **Frontend:** React-based UI with Tailwind CSS.
    *   **Backend:** Next.js Server Components and Server Actions.
    *   **ORM:** Prisma for type-safe database access.
    *   **Database:** PostgreSQL.
    *   **Security Layer:** NextAuth.js and Middleware.
*   **Component Interaction:** Client components trigger Server Actions; Server Components fetch data directly from the database; Middleware intercepts every request to verify role-based permissions.
*   **Entry Points:** `src/app/page.tsx` (Home/Login) and `src/middleware.ts` (Global auth entry).
*   **External Services:** NextAuth (Authentication), PostgreSQL (Hosting), Stripe (Planned payment gateway).

---

## 3️⃣ Technology Stack
*   **Programming Language:** TypeScript (v5.5.0)
*   **Framework:** Next.js (v14.2.0)
*   **Library (UI):** React 18, Tailwind CSS, shadcn/ui.
*   **Library (Forms):** React Hook Form, Zod (Validation).
*   **ORM:** Prisma (v5.19.0).
*   **Authentication:** NextAuth.js (v4.24.7).
*   **Utilities:** Lucide React (Icons), date-fns (Date formatting), bcryptjs (Hashing).
*   **Runtime:** Node.js.

---

## 4️⃣ Codebase Structure
*   **Major Folders:**
    *   `src/app/`: File-based routing and layout definitions.
    *   `src/modules/`: Feature-specific logic (e.g., `/student`, `/lecturer`) to maintain separation of concerns.
    *   `src/components/`: Shared UI primitives and complex shared components.
    *   `src/lib/`: Core singletons (Prisma client, Auth config) and utility functions.
    *   `prisma/`: Single source of truth for the database schema.
*   **Critical Files:**
    *   `prisma/schema.prisma`: The "Heart" of the data layer.
    *   `src/middleware.ts`: The "Gatekeeper" of the application.
    *   `src/lib/auth.ts`: Authentication strategies.
*   **Configuration:** `next.config.js`, `tailwind.config.ts`, `.env`.

---

## 5️⃣ Core Features & Functionalities
*   **User-facing Features:** Course registration, Grade viewing, Fee payment processing, Assignment submission, Announcement dashboard.
*   **Background/System Features:** Automatic session management, Role-based route protection, PDF receipt generation.
*   **Feature Dependencies:** Course registration requires "Cleared" finance status; Grading requires active student enrollment in the course.
*   **Entry Points:** Role-specific layout wrappers in `src/app/(dashboard)/`.

---

## 6️⃣ Data & Database
*   **Database Type:** Relational (PostgreSQL).
*   **Data Models:** User, Department, Course, CourseEnrollment, Assignment, Grade, Attendance, FeeStructure, Payment, Announcement, Notification.
*   **Fields & Types:** IDs (CUID strings), Scores (Float), Dates (DateTime), Roles (Enums).
*   **Relationships:**
    *   **1:N:** Department to Users/Courses.
    *   **M:N:** Students to Courses (via Enrollment joining table).
    *   **Self-Relation:** Course to Course for prerequisites.
*   **Data Flow:** Form Input -> Zod Validation -> Server Action -> Prisma -> PostgreSQL.

---

## 7️⃣ Business Logic & Rules
*   **Core Rules:** Students must satisfy prerequisites before enrolling; Lecturers can only grade students enrolled in their assigned courses.
*   **Validation Rules:** Schema-level validation for email formats, password strength, and numeric grade ranges.
*   **Conditional Flows:** Redirection to `/unauthorized` on role mismatch; "Finance Block" on academic features if fees are outstanding.
*   **Decision Points:** Administrative approval of grades before they are visible to students.

---

## 8️⃣ Algorithms / AI / Automation
*   **Algorithms:**
    *   **Bcryptjs:** Hashing algorithm for password security.
    *   **Prerequisite Checking:** Recursive logic to verify academic eligibility.
*   **Inputs/Outputs:** Raw user inputs mapped to validated database records.
*   **Thresholds:** `maxStudents` per course; 70% attendance required for exam eligibility (logic implemented).

---

## 9️⃣ Authentication & Security
*   **Method:** NextAuth Credentials Provider.
*   **Authorization:** Role-Based Access Control (RBAC) via Middleware.
*   **Mechanisms:** JWT (JSON Web Tokens) for sessions; CSRF protection; secure password salting.
*   **Sensitive Data:** Passwords salted/hashed; strict environment variable usage; no sensitive data in client-side logs.
*   **Vulnerabilities:** Client-side form hacking (mitigated by server-side Zod re-validation).

---

## 🔟 Error Handling & Edge Cases
*   **Common Errors:** Database constraint violations; session expirations.
*   **Failure Points:** External API failures (payment gateway); DB connection drops.
*   **Edge Cases:** Concurrent enrollment for the last available course slot; retroactive grade changes.
*   **Recovery:** `ErrorBoundary.tsx` UI wrappers; transactional database operations to prevent partial data writes.

---

## 1️⃣1️⃣ Performance & Scalability
*   **Bottlenecks:** Large-scale Grade calculations for final transcripts.
*   **Intensive Operations:** PDF generation for thousands of students; complex multi-table joins.
*   **Scalability:** Vertical scaling through database upgrades; Horizontal scaling via stateless JWT sessions.
*   **Optimizations:** DB Indexing on frequently queried fields (`email`, `studentId`); React Server Components for reduced client-side JS.

---

## 1️⃣2️⃣ Testing & Validation
*   **Types:** Manual integration testing of business workflows.
*   **Coverage:** Auth, CRUD operations, Enrollment logic.
*   **Untested:** Automated end-to-end tests (Cypress/Playwright not yet implemented).
*   **Known Bugs:** Minor UI alignment issues on extremely small mobile screens.

---

## 1️⃣3️⃣ Deployment & Environment
*   **Method:** Vercel/Docker.
*   **Variables:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`.
*   **Build Steps:** Schema generation -> Type check -> Production build.
*   **Runtime:** Node.js LTS.

---

## 1️⃣4️⃣ Limitations & Risks
*   **Technical:** Single-point-of-failure database (mitigated by backups).
*   **Design:** Desktop-first focus (enhanced with Tailwind responsiveness).
*   **Risk:** Token theft (mitigated by Short-lived JWTs).
*   **Ethical:** Security of student sensitive data (Grades/Finance).

---

## 1️⃣5️⃣ Examiner Defense Preparation
*   **Key Focus Areas:** RBAC implementation; Next.js 14 architecture; Database normalization.
*   **Weak Areas:** Lack of unit test suite; basic state management for complex multi-step forms.
*   **Design Justifications:** Modular architecture for ease of scaling; Server Actions for reduced API boilerplate.
*   **Likely Questions:**
    *   "How does your system prevent a student from manually entering their own grades via the API?"
    *   "Explain the relationship between CourseEnrollment and Grade models."
    *   "Why did you choose PostgreSQL over a NoSQL database like MongoDB for this portal?"

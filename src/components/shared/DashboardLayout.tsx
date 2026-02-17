"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserRole } from "@prisma/client"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  CreditCard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList
} from "lucide-react"
import { useState } from "react"
import { NotificationCenter } from "./NotificationCenter"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const studentNavItems: NavItem[] = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard },
  { title: "Courses", href: "/student/courses", icon: BookOpen },
  { title: "Timetable", href: "/student/timetable", icon: Calendar },
  { title: "Grades", href: "/student/grades", icon: GraduationCap },
  { title: "Payments", href: "/student/payments", icon: CreditCard },
  { title: "Transcripts", href: "/student/transcripts", icon: FileText },
]

const lecturerNavItems: NavItem[] = [
  { title: "Dashboard", href: "/lecturer", icon: LayoutDashboard },
  { title: "My Courses", href: "/lecturer/courses", icon: BookOpen },
  { title: "Materials", href: "/lecturer/materials", icon: FileText },
  { title: "Assignments", href: "/lecturer/assignments", icon: FileText },
  { title: "Grading", href: "/lecturer/grading", icon: GraduationCap },
  { title: "Attendance", href: "/lecturer/attendance", icon: Calendar },
]

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Applications", href: "/admin/applications", icon: ClipboardList },
  { title: "Students", href: "/admin/students", icon: Users },
  { title: "Lecturers", href: "/admin/lecturers", icon: Users },
  { title: "Courses", href: "/admin/courses", icon: BookOpen },
  { title: "Departments", href: "/admin/departments", icon: Settings },
  { title: "Results", href: "/admin/results", icon: GraduationCap },
  { title: "Announcements", href: "/admin/announcements", icon: FileText },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

const financeNavItems: NavItem[] = [
  { title: "Dashboard", href: "/finance", icon: LayoutDashboard },
  { title: "Fee Structure", href: "/finance/fees", icon: CreditCard },
  { title: "Payments", href: "/finance/payments", icon: CreditCard },
  { title: "Receipts", href: "/finance/receipts", icon: FileText },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getNavItems = () => {
    switch (role) {
      case "STUDENT":
        return studentNavItems
      case "LECTURER":
        return lecturerNavItems
      case "ADMIN":
        return adminNavItems
      case "FINANCE":
        return financeNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-6">
            <h1 className="text-xl font-bold text-primary">University Portal</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="border-t p-4">
            <div className="mb-2 px-4 py-2 text-sm">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <span className="text-sm text-gray-600">
              {session?.user?.name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}


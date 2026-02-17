import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/shared/DashboardLayout"

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "FINANCE") {
    redirect("/login")
  }

  return <DashboardLayout role="FINANCE">{children}</DashboardLayout>
}





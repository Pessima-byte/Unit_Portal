import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentManagement } from "@/modules/finance/components/PaymentManagement"
import { getPaginationParams, calculateTotalPages } from "@/lib/pagination"
import { Pagination } from "@/components/shared/Pagination"

export default async function FinancePaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FINANCE") {
    return null
  }

  const status = searchParams.status as string | undefined
  const { page, skip, take } = getPaginationParams(searchParams)

  const whereClause = status ? { status: status as any } : undefined

  // Fetch payments with pagination
  const [payments, totalCount] = await Promise.all([
    db.payment.findMany({
      where: whereClause,
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        transactionId: true,
        receiptUrl: true,
        createdAt: true,
        paidAt: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            studentId: true,
            email: true,
          },
        },
        feeStructure: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            semester: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.payment.count({
      where: whereClause,
    }),
  ])

  const totalPages = calculateTotalPages(totalCount)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">View and manage all payment transactions</p>
      </div>

      <PaymentManagement payments={payments} />

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/finance/payments"
          />
        </div>
      )}
    </div>
  )
}



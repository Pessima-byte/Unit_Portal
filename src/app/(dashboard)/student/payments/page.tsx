import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentForm } from "@/modules/student/components/PaymentForm"

export default async function StudentPaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const studentId = session.user.id

  // Fetch payments and fee structures (optimized queries)
  const [payments, feeStructures] = await Promise.all([
    db.payment.findMany({
      where: { studentId },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        transactionId: true,
        receiptUrl: true,
        createdAt: true,
        paidAt: true,
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
      take: 20, // Limit to recent 20 payments
    }),
    db.feeStructure.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        amount: true,
        academicYear: true,
        semester: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { academicYear: "desc" },
    }),
  ])

  const totalPaid = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = payments.filter((p) => p.status === "PENDING")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee Payments</h1>
        <p className="text-muted-foreground">Manage your fee payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Make Payment</CardTitle>
            <CardDescription>Pay your fees online</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm feeStructures={feeStructures} />
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{payment.feeStructure.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.feeStructure.academicYear}
                        {payment.feeStructure.semester && ` • ${payment.feeStructure.semester}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <p
                        className={`text-xs ${
                          payment.status === "COMPLETED"
                            ? "text-green-600"
                            : payment.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.status}
                      </p>
                      {payment.receiptUrl && (
                        <Button variant="link" size="sm" asChild>
                          <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                            Receipt
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No payments yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReceiptGenerator } from "@/modules/finance/components/ReceiptGenerator"

export default async function FinanceReceiptsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FINANCE") {
    return null
  }

  // Fetch completed payments
  const payments = await db.payment.findMany({
    where: { status: "COMPLETED" },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          studentId: true,
          email: true,
        },
      },
      feeStructure: true,
    },
    orderBy: { paidAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receipts</h1>
        <p className="text-muted-foreground">Generate and manage payment receipts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
          <CardDescription>Completed payments with receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {payment.student.firstName} {payment.student.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {payment.feeStructure.name} • {payment.feeStructure.academicYear}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.student.studentId || payment.student.email} •{" "}
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">${payment.amount.toFixed(2)}</p>
                      {payment.transactionId && (
                        <p className="text-xs text-muted-foreground">
                          {payment.transactionId}
                        </p>
                      )}
                    </div>
                    <ReceiptGenerator payment={payment} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No completed payments yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



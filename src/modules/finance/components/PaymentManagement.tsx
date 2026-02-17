"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updatePaymentStatus } from "@/modules/finance/actions/paymentActions"
import { useRouter } from "next/navigation"

interface Payment {
  id: string
  amount: number
  status: string
  paymentMethod: string | null
  transactionId: string | null
  receiptUrl: string | null
  paidAt: Date | null
  createdAt: Date
  student: {
    firstName: string
    lastName: string
    studentId: string | null
    email: string
  }
  feeStructure: {
    name: string
    academicYear: string
  }
}

interface PaymentManagementProps {
  payments: Payment[]
}

export function PaymentManagement({ payments }: PaymentManagementProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filteredPayments =
    filter === "all"
      ? payments
      : payments.filter((p) => p.status === filter.toUpperCase())

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        const result = await updatePaymentStatus(paymentId, newStatus)
        if (result.success) {
          setMessage({ type: "success", text: "Payment status updated successfully!" })
          setTimeout(() => router.refresh(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update payment status" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No payments found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filter === "failed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("failed")}
        >
          Failed
        </Button>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {payment.student.firstName} {payment.student.lastName}
                    </h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        payment.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : payment.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {payment.student.email} • {payment.student.studentId || "No ID"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {payment.feeStructure.name} • {payment.feeStructure.academicYear}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>
                      Created: {new Date(payment.createdAt).toLocaleString()}
                    </p>
                    {payment.paidAt && (
                      <p>Paid: {new Date(payment.paidAt).toLocaleString()}</p>
                    )}
                    {payment.transactionId && (
                      <p>Transaction ID: {payment.transactionId}</p>
                    )}
                    {payment.paymentMethod && (
                      <p>Method: {payment.paymentMethod}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${payment.amount.toFixed(2)}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {payment.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(payment.id, "COMPLETED")}
                          disabled={isPending}
                        >
                          Mark Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(payment.id, "FAILED")}
                          disabled={isPending}
                        >
                          Mark Failed
                        </Button>
                      </>
                    )}
                    {payment.receiptUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                          View Receipt
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}





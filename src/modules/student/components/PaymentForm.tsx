"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { makePayment } from "@/modules/student/actions/paymentActions"

interface FeeStructure {
  id: string
  name: string
  amount: number
  academicYear: string
  semester: string | null
  department: {
    name: string
  } | null
}

interface PaymentFormProps {
  feeStructures: FeeStructure[]
}

export function PaymentForm({ feeStructures }: PaymentFormProps) {
  const [selectedFee, setSelectedFee] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [paymentResult, setPaymentResult] = useState<{ demo?: boolean } | null>(null)

  const selectedFeeStructure = feeStructures.find((f) => f.id === selectedFee)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFee) {
      setMessage({ type: "error", text: "Please select a fee structure" })
      return
    }

    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" })
      return
    }

    startTransition(async () => {
      try {
        const result = await makePayment(selectedFee, paymentAmount)
        setPaymentResult(result)
        if (result.success) {
          const successMessage = result.demo
            ? "Payment processed successfully! (Demo Mode)"
            : "Payment initiated successfully!"
          setMessage({ type: "success", text: successMessage })
          setSelectedFee("")
          setAmount("")
          setTimeout(() => window.location.reload(), 2000)
        } else {
          setMessage({ type: "error", text: result.error || "Payment failed" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="fee">Select Fee Structure</Label>
        <select
          id="fee"
          value={selectedFee}
          onChange={(e) => {
            setSelectedFee(e.target.value)
            const fee = feeStructures.find((f) => f.id === e.target.value)
            if (fee) {
              setAmount(fee.amount.toString())
            }
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select a fee...</option>
          {feeStructures.map((fee) => (
            <option key={fee.id} value={fee.id}>
              {fee.name} - ${fee.amount.toFixed(2)} ({fee.academicYear}
              {fee.semester && ` • ${fee.semester}`})
            </option>
          ))}
        </select>
      </div>

      {selectedFeeStructure && (
        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium">{selectedFeeStructure.name}</p>
          <p className="text-muted-foreground">
            Amount: ${selectedFeeStructure.amount.toFixed(2)}
          </p>
          {selectedFeeStructure.department && (
            <p className="text-muted-foreground">
              Department: {selectedFeeStructure.department.name}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={!selectedFee}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending || !selectedFee}>
        {isPending ? "Processing..." : "Make Payment"}
      </Button>

      {paymentResult?.demo && (
        <p className="text-xs text-green-600">
          ✓ Payment processed successfully (Demo Mode - Stripe not configured)
        </p>
      )}

      {!paymentResult?.demo && paymentResult && (
        <p className="text-xs text-muted-foreground">
          Note: In production, this would redirect to Stripe checkout. Currently in demo mode.
        </p>
      )}
    </form>
  )
}



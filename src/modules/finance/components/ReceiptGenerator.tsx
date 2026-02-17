"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { generateReceiptPDF } from "@/lib/pdf/receipt"

interface Payment {
  id: string
  amount: number
  transactionId: string | null
  paidAt: Date | null
  paymentMethod: string | null
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

interface ReceiptGeneratorProps {
  payment: Payment
}

export function ReceiptGenerator({ payment }: ReceiptGeneratorProps) {
  const handleGenerate = () => {
    generateReceiptPDF({
      paymentId: payment.id,
      studentName: `${payment.student.firstName} ${payment.student.lastName}`,
      studentId: payment.student.studentId,
      studentEmail: payment.student.email,
      feeName: payment.feeStructure.name,
      amount: payment.amount,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      academicYear: payment.feeStructure.academicYear,
      paymentMethod: payment.paymentMethod,
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleGenerate}>
      <FileText className="mr-2 h-4 w-4" />
      Generate Receipt
    </Button>
  )
}




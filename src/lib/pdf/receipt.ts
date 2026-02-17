"use client"

import jsPDF from "jspdf"

interface ReceiptData {
  paymentId: string
  studentName: string
  studentId: string | null
  studentEmail: string
  feeName: string
  amount: number
  transactionId: string | null
  paidAt: Date | null
  academicYear: string
  paymentMethod: string | null
}

export function generateReceiptPDF(data: ReceiptData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = margin

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("PAYMENT RECEIPT", pageWidth / 2, yPos, { align: "center" })
  yPos += 15

  // University Info
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("University Portal", pageWidth / 2, yPos, { align: "center" })
  yPos += 20

  // Receipt Details
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Receipt Details", margin, yPos)
  yPos += 8

  doc.setFont("helvetica", "normal")
  const details = [
    ["Receipt Number:", data.paymentId.substring(0, 8).toUpperCase()],
    ["Date:", data.paidAt ? new Date(data.paidAt).toLocaleDateString() : "N/A"],
    ["Transaction ID:", data.transactionId || "N/A"],
    ["Payment Method:", data.paymentMethod || "Online"],
  ]

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 60, yPos)
    yPos += 7
  })

  yPos += 5

  // Student Information
  doc.setFont("helvetica", "bold")
  doc.text("Student Information", margin, yPos)
  yPos += 8

  doc.setFont("helvetica", "normal")
  const studentInfo = [
    ["Name:", data.studentName],
    ["Student ID:", data.studentId || "N/A"],
    ["Email:", data.studentEmail],
  ]

  studentInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 60, yPos)
    yPos += 7
  })

  yPos += 5

  // Payment Information
  doc.setFont("helvetica", "bold")
  doc.text("Payment Information", margin, yPos)
  yPos += 8

  doc.setFont("helvetica", "normal")
  const paymentInfo = [
    ["Fee Structure:", data.feeName],
    ["Academic Year:", data.academicYear],
    ["Amount Paid:", `$${data.amount.toFixed(2)}`],
  ]

  paymentInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 60, yPos)
    yPos += 7
  })

  yPos += 10

  // Total Amount (highlighted)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Total Amount:", margin, yPos)
  doc.text(`$${data.amount.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" })
  yPos += 15

  // Footer
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.text(
    "This is a computer-generated receipt. No signature required.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 15,
    { align: "center" }
  )

  // Save PDF
  doc.save(`receipt-${data.paymentId.substring(0, 8)}.pdf`)
}




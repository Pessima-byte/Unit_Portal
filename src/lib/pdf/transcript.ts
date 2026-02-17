"use client"

import jsPDF from "jspdf"

interface CourseGrade {
  code: string
  name: string
  creditUnits: number
  department: string
  level: number
  semester: string
  academicYear: string
  average: number | null
  letterGrade: string | null
}

interface TranscriptData {
  studentName: string
  studentId: string | null
  studentEmail: string
  gpa: number
  totalCredits: number
  courses: CourseGrade[]
}

export function generateTranscriptPDF(data: TranscriptData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = margin

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("ACADEMIC TRANSCRIPT", pageWidth / 2, yPos, { align: "center" })
  yPos += 15

  // University Info
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("University Portal", pageWidth / 2, yPos, { align: "center" })
  yPos += 20

  // Student Information
  doc.setFontSize(10)
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

  // Academic Summary
  doc.setFont("helvetica", "bold")
  doc.text("Academic Summary", margin, yPos)
  yPos += 8

  doc.setFont("helvetica", "normal")
  const summary = [
    ["GPA:", data.gpa.toFixed(2)],
    ["Total Credits:", data.totalCredits.toString()],
  ]

  summary.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 60, yPos)
    yPos += 7
  })

  yPos += 10

  // Course Grades Table Header
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  const tableHeaders = ["Code", "Course Name", "Credits", "Grade", "GPA"]
  const colWidths = [25, 80, 20, 20, 25]
  let xPos = margin

  tableHeaders.forEach((header, index) => {
    doc.text(header, xPos, yPos)
    xPos += colWidths[index]
  })

  yPos += 8
  doc.setLineWidth(0.5)
  doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3)

  // Course Grades
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")

  data.courses.forEach((course) => {
    if (yPos > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage()
      yPos = margin
    }

    xPos = margin
    const rowData = [
      course.code,
      course.name.substring(0, 35),
      course.creditUnits.toString(),
      course.letterGrade || "N/A",
      course.average ? course.average.toFixed(1) : "N/A",
    ]

    rowData.forEach((cell, index) => {
      doc.text(cell, xPos, yPos)
      xPos += colWidths[index]
    })

    yPos += 7
  })

  // Footer
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.text(
    "This is an official academic transcript.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 15,
    { align: "center" }
  )

  // Save PDF
  const filename = `transcript-${data.studentId || data.studentEmail.split("@")[0]}.pdf`
  doc.save(filename)
}




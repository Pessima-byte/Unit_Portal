"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { generateTranscriptPDF } from "@/lib/pdf/transcript"

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

interface TranscriptGeneratorProps {
  studentName: string
  studentId: string | null
  studentEmail: string
  gpa: number
  totalCredits: number
  courses: CourseGrade[]
}

export function TranscriptGenerator({
  studentName,
  studentId,
  studentEmail,
  gpa,
  totalCredits,
  courses,
}: TranscriptGeneratorProps) {
  const handleGenerate = () => {
    generateTranscriptPDF({
      studentName,
      studentId,
      studentEmail,
      gpa,
      totalCredits,
      courses,
    })
  }

  return (
    <Button onClick={handleGenerate}>
      <FileText className="mr-2 h-4 w-4" />
      Download PDF
    </Button>
  )
}




import { z } from "zod"

export const gradeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseId: z.string().min(1, "Course is required"),
  assignmentId: z.string().optional(),
  score: z.number().min(0, "Score cannot be negative"),
  maxScore: z.number().positive("Max score must be positive"),
  remarks: z.string().optional(),
})

export type GradeInput = z.infer<typeof gradeSchema>




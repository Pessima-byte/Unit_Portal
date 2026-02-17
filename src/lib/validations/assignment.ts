import { z } from "zod"

export const assignmentSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.date(),
  maxScore: z.number().positive("Max score must be positive"),
})

export type AssignmentInput = z.infer<typeof assignmentSchema>




import { z } from "zod"

export const feeStructureSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  academicYear: z.string().min(4, "Academic year is required"),
  semester: z.enum(["Fall", "Spring", "Summer"]).optional(),
  level: z.number().int().min(100).max(900).optional(),
  dueDate: z.date().optional(),
  departmentId: z.string().optional(),
})

export type FeeStructureInput = z.infer<typeof feeStructureSchema>




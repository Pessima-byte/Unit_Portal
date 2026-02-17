import { z } from "zod"

export const courseSchema = z.object({
  code: z.string().min(2, "Course code must be at least 2 characters"),
  name: z.string().min(3, "Course name must be at least 3 characters"),
  description: z.string().optional(),
  creditUnits: z.number().int().min(1).max(10),
  level: z.number().int().min(100).max(900),
  semester: z.enum(["Fall", "Spring", "Summer"]),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Format: YYYY-YYYY"),
  maxStudents: z.number().int().positive().optional(),
  departmentId: z.string().min(1, "Department is required"),
  lecturerId: z.string().optional(),
})

export type CourseInput = z.infer<typeof courseSchema>




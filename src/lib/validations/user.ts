import { z } from "zod"

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
})

export const createUserSchema = userSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "LECTURER", "ADMIN", "FINANCE"]),
})

export type UserInput = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>




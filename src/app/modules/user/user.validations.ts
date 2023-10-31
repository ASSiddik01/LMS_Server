import { z } from 'zod'

// Create user zod validation schema
export const updateUserZod = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
})

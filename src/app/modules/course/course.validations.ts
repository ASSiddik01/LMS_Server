
import { z } from 'zod'

// Create course zod validation schema
export const createCourseZod = z.object({
  body: z.object({
    key: z.string({
      required_error: 'Z: Key name is required',
    }),
  }),
})

import { Request, Response } from 'express'
import { tryCatch } from '../../../utilities/tryCatch'
import { sendRes } from '../../../utilities/sendRes'
import httpStatus from 'http-status'
import { Course } from '@prisma/client'
import { createCourseService } from './course.services'

// create course controller
export const createCourse = tryCatch(async (req: Request, res: Response) => {
  const { benifits, prerequisites, courseDatas, courseThumbnail, ...course } =
    req.body
  const result = await createCourseService(
    course,
    courseThumbnail,
    benifits,
    prerequisites,
    courseDatas
  )
  sendRes<Course>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Create course successfully',
    data: result,
  })
})

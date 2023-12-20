import { Request, Response } from 'express'
import { tryCatch } from '../../../utilities/tryCatch'
import { sendRes } from '../../../utilities/sendRes'
import httpStatus from 'http-status'
import { Course } from '@prisma/client'
import {
  createCourseService,
  deleteCourseService,
  getCourseService,
  getCoursesService,
} from './course.services'
import { courseFilterableFields } from './course.constants'
import { pick } from '../../../utilities/pick'
import { paginationFields } from '../../../constants/pagination'

// create course
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

// get courses
export const getCourses = tryCatch(async (req: Request, res: Response) => {
  const filters = pick(req.query, courseFilterableFields)
  const options = pick(req.query, paginationFields)
  const result = await getCoursesService(filters, options)

  sendRes<Course[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Courses retrieved successfully',
    meta: result?.meta,
    data: result?.data,
  })
})

// get course
export const getCourse = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await getCourseService(id)

  sendRes<Partial<Course>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course retrieved successfully',
    data: result,
  })
})

// delete course
export const deleteCourse = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params

  const result = await deleteCourseService(id)
  sendRes<Course>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delete course successfully',
    data: result,
  })
})

import {
  Course,
  CourseBenifit,
  CourseData,
  CoursePrerequisite,
} from '@prisma/client'
import prisma from '../../../utilities/prisma'
import bcrypt from 'bcrypt'
import config from '../../../config'
import httpStatus from 'http-status'
import { ApiError } from './../../../errorFormating/apiError'

// create course service
export const createCourseService = async (
  course: Course,
  benifits: CourseBenifit,
  prerequisites: CoursePrerequisite,
  courseData: CourseData
): Promise<Course | null> => {
  // const createdCourse = await prisma.course.create({
  //   data: course,
  // })

  benifits.courseId = 'dfaffdf'
  // await prisma.courseBenifit.create({
  //   data: benifits,
  // })

  console.log(benifits)

  // prerequisites.courseId = createdCourse.id
  // await prisma.coursePrerequisite.create({
  //   data: prerequisites,
  // })

  return null
}

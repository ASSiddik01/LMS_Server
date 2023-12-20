/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Course,
  CourseBenifit,
  CourseData,
  CoursePrerequisite,
  Prisma,
} from '@prisma/client'
import prisma from '../../../utilities/prisma'
import cloudinary from 'cloudinary'
import httpStatus from 'http-status'
import { ApiError } from './../../../errorFormating/apiError'
import { asyncForEach } from '../../../utilities/asyncForEach'
import { coursePopulate, courseSearchableFields } from './course.constants'
import { IPaginationOptions } from '../../../interface/pagination'
import { ICourseFilterRequest } from './course.interfaces'
import { calculatePagination } from '../../../helpers/paginationHelper'
import { IGenericResponse } from '../../../interface/common'

// create course
export const createCourseService = async (
  course: Course,
  courseThumbnail: string,
  benifits: CourseBenifit[],
  prerequisites: CoursePrerequisite[],
  courseDatas: CourseData[]
): Promise<Course | null> => {
  const isExist = await prisma.course.findUnique({
    where: {
      name: course.name,
    },
  })

  if (isExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Similar course already exist')
  }

  const savedCourse = await prisma.$transaction(async courseTransaction => {
    const result = await courseTransaction.course.create({
      data: course,
    })

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course')
    }

    // thumbnail
    if (courseThumbnail) {
      const photo = await cloudinary.v2.uploader.upload(courseThumbnail, {
        folder: 'lms/course',
      })

      const data = {
        courseId: result?.id,
        public_id: photo?.public_id,
        url: photo?.secure_url,
      }

      await courseTransaction.courseThumbnail.create({
        data,
      })
    }

    // // benifits
    if (benifits && benifits.length > 0) {
      await asyncForEach(benifits, async (benifit: { title: string }) => {
        await courseTransaction.courseBenifit.create({
          data: {
            courseId: result?.id,
            title: benifit.title,
          },
        })
      })
    }

    // prerequisite
    if (prerequisites && prerequisites.length > 0) {
      await asyncForEach(
        prerequisites,
        async (prerequisite: { title: string }) => {
          await courseTransaction.coursePrerequisite.create({
            data: {
              courseId: result?.id,
              title: prerequisite.title,
            },
          })
        }
      )
    }

    // CourseData
    if (courseDatas && courseDatas.length > 0) {
      await asyncForEach(
        courseDatas,
        async (courseData: {
          videoUrl: string
          title: string
          videoSection: string
          description: string
          videoLength: bigint
          videoPlayer: string
          suggestion: string
        }) => {
          await courseTransaction.courseData.create({
            // @ts-ignore
            data: {
              courseId: result?.id,
              ...courseData,
            },
          })
        }
      )
    }

    return result
  })

  if (savedCourse) {
    const result = await prisma.course.findUnique({
      where: {
        id: savedCourse.id,
      },
      include: coursePopulate,
    })

    return result
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course')
}

// get courses
export const getCoursesService = async (
  filters: ICourseFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Course[]>> => {
  const { limit, page, skip, sortBy, sortOrder } = calculatePagination(options)
  const { searchTerm, ...filterData } = filters

  const andConditions = []

  if (searchTerm) {
    andConditions.push({
      OR: courseSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          // mode: 'insensitive',
        },
      })),
    })
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    })
  }

  const whereConditions: Prisma.CourseWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {}

  const result = await prisma.course.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: coursePopulate,
  })

  const total = await prisma.course.count({
    where: whereConditions,
  })

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Courses retrieved failed')
  }

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  }
}

// get course
export const getCourseService = async (
  id: string
): Promise<Partial<Course>> => {
  const result = await prisma.course.findUnique({
    where: {
      id,
    },
  })

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course retrieved failed')
  }
  return result
}

// delete course
export const deleteCourseService = async (
  id: string
): Promise<Course | null> => {
  const isExist = await prisma.course.findUnique({
    where: {
      id,
    },
    include: coursePopulate,
  })

  if (!isExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Course not found')
  }

  const deletedCourse = await prisma.$transaction(async courseTransaction => {
    await courseTransaction.courseData.deleteMany({
      where: {
        courseId: id,
      },
    })

    await courseTransaction.coursePrerequisite.deleteMany({
      where: {
        courseId: id,
      },
    })

    await courseTransaction.courseBenifit.deleteMany({
      where: {
        courseId: id,
      },
    })

    if (isExist?.courseThumbnail?.public_id) {
      await cloudinary.v2.uploader.destroy(isExist?.courseThumbnail?.public_id)
    }

    await courseTransaction.courseThumbnail.deleteMany({
      where: {
        courseId: id,
      },
    })

    const result = await courseTransaction.course.deleteMany({
      where: {
        id,
      },
    })

    return result
  })

  if (deletedCourse) {
    return null
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to delete course')
}

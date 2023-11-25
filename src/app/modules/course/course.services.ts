/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Course,
  CourseBenifit,
  CourseData,
  CoursePrerequisite,
} from '@prisma/client'
import prisma from '../../../utilities/prisma'
import cloudinary from 'cloudinary'
import httpStatus from 'http-status'
import { ApiError } from './../../../errorFormating/apiError'
import { asyncForEach } from '../../../utilities/asyncForEach'

// create course service
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
      include: {
        courseThumbnail: true,
        courseBenifits: true,
        coursePrerequisites: true,
        courseDatas: true,
      },
    })

    return result
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course')
}

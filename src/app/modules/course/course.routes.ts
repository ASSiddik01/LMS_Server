import express from 'express'
import reqValidate from '../../../middleware/reqValidate'
import { auth } from '../../../middleware/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
import { createCourseZod } from './course.validations'
import {
  createCourse,
  deleteCourse,
  getCourse,
  getCourses,
  updateCourse,
} from './course.controllers'

const router = express.Router()

router.route('/').post(auth(ENUM_USER_ROLE.ADMIN), createCourse).get(getCourses)

router
  .route('/:id')
  .get(auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), getCourse)
  .patch(auth(ENUM_USER_ROLE.ADMIN), updateCourse)
  .delete(auth(ENUM_USER_ROLE.ADMIN), deleteCourse)

export default router

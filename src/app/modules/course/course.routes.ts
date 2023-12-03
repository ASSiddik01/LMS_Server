import express from 'express'
import reqValidate from '../../../middleware/reqValidate'
import { auth } from '../../../middleware/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
import { createCourseZod } from './course.validations'
import { createCourse, getCourse, getCourses } from './course.controllers'

const router = express.Router()

router.route('/').post(auth(ENUM_USER_ROLE.ADMIN), createCourse).get(getCourses)

router
  .route('/:id')
  .get(auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), getCourse)

export default router

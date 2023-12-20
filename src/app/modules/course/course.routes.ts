import express from 'express'
import { auth } from '../../../middleware/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
import {
  createCourse,
  deleteCourse,
  getCourse,
  getCourses,
} from './course.controllers'

const router = express.Router()

router.route('/').post(auth(ENUM_USER_ROLE.ADMIN), createCourse).get(getCourses)

router
  .route('/:id')
  .get(auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), getCourse)
  .delete(auth(ENUM_USER_ROLE.ADMIN), deleteCourse)

export default router

import express from 'express'
import reqValidate from '../../../middleware/reqValidate'
import { auth } from '../../../middleware/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
import { createCourseZod } from './course.validations'
import { createCourse, getCourses } from './course.controllers'

const router = express.Router()

router.route('/').post(auth(ENUM_USER_ROLE.USER), createCourse).get(getCourses)

export default router

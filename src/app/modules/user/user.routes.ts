import express from 'express'
import reqValidate from '../../../middleware/reqValidate'
import { auth } from '../../../middleware/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
import {
  deleteUser,
  getUser,
  getUserProfile,
  getUsers,
  updateUser,
  uploadPhoto,
} from './user.controllers'
import { updateUserZod } from './user.validations'

const router = express.Router()

// example route
router.route('/profile').get(auth(ENUM_USER_ROLE.USER), getUserProfile)
router.route('/photo').post(auth(ENUM_USER_ROLE.USER), uploadPhoto)

router.route('/').get(auth(ENUM_USER_ROLE.USER), getUsers)

router
  .route('/:id')
  .get(auth(ENUM_USER_ROLE.USER), getUser)
  .patch(auth(ENUM_USER_ROLE.USER), reqValidate(updateUserZod), updateUser)
  .delete(auth(ENUM_USER_ROLE.USER), deleteUser)

export default router

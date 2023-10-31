import { tryCatch } from '../../../utilities/tryCatch'
import { sendRes } from '../../../utilities/sendRes'
import httpStatus from 'http-status'
import { User } from '@prisma/client'
import {
  deleteUserService,
  getUserProfileService,
  getUserService,
  getUsersService,
  updateUserService,
  uploadPhotoService,
} from './user.services'
import { Request, Response } from 'express'

// get user profile
export const getUserProfile = tryCatch(async (req: Request, res: Response) => {
  const result = await getUserProfileService(req.user?.email)
  sendRes<User>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User get successfully',
    data: result,
  })
})

// update photo
export const uploadPhoto = tryCatch(async (req: Request, res: Response) => {
  const result = await uploadPhotoService(req.user?.email, req.body.photo)
  sendRes<User>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Photo upload successfully',
    data: result,
  })
})

// get users
export const getUsers = tryCatch(async (req: Request, res: Response) => {
  const result = await getUsersService()

  sendRes<Partial<Omit<User, 'password'>[]>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  })
})

// get user
export const getUser = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await getUserService(id)

  sendRes<Partial<User>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  })
})

// update user
export const updateUser = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await updateUserService(id, req.body)

  sendRes<Partial<User>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  })
})

// delete user
export const deleteUser = tryCatch(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await deleteUserService(id)

  sendRes<Partial<User>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  })
})

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '../../../utilities/prisma'
import httpStatus from 'http-status'
import { ApiError } from './../../../errorFormating/apiError'
import { User } from '@prisma/client'
import { isExist } from '../auth/auth.utils'
import { JwtPayload } from 'jsonwebtoken'

// create user service
export const getUserProfileService = async (payload: string) => {
  const result = await prisma.user.findUnique({
    where: {
      email: payload,
    },
  })

  return result
}
// get users
export const getUsersService = async (): Promise<
  Partial<Omit<User, 'password'>[]>
> => {
  const result = await prisma.user.findMany()
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users retrieved failed')
  }
  return result
}

// get user
export const getUserService = async (id: string): Promise<Partial<User>> => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User retrieved failed')
  }
  return result
}

// update user
export const updateUserService = async (
  id: string,
  payload: Partial<User>
): Promise<Partial<User | null>> => {
  const existUser = await prisma.user.findUnique({
    where: {
      id,
    },
  })
  const { role, password, ...others } = payload

  const [userEmail, userPhone] = await Promise.all([
    isExist(others?.email as string),
    isExist(others?.phone as string),
  ])

  if (userEmail?.email !== existUser?.email && existUser) {
    throw new Error('Email is used in another user')
  }

  if (userPhone?.phone !== existUser?.phone && existUser) {
    throw new Error('Phone is used in another user')
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: others,
  })
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User update failed')
  }

  return result
}

// delete user
export const deleteUserService = async (id: string): Promise<Partial<User>> => {
  const result = await prisma.user.delete({
    where: {
      id,
    },
  })

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User deleted failed')
  }
  return result
}

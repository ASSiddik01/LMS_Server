/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '../../../utilities/prisma'
import httpStatus from 'http-status'
import { ApiError } from './../../../errorFormating/apiError'
import { User, UserPhoto } from '@prisma/client'
import { isExist } from '../auth/auth.utils'
import { userPopulate } from './user.constants'
import cloudinary from 'cloudinary'

// get user profile
export const getUserProfileService = async (payload: string) => {
  const result = await prisma.user.findUnique({
    where: {
      email: payload,
    },
  })

  return result
}

// user photo upload
export const uploadPhotoService = async (email: string, payload: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: userPopulate,
  })

  if (user?.photo?.public_id) {
    const { public_id } = user.photo
    await cloudinary.v2.uploader.destroy(public_id)
    const photo = await cloudinary.v2.uploader.upload(payload, {
      folder: 'lms/user',
      width: 200,
    })

    const data: Partial<UserPhoto> = {
      userId: user?.id,
      public_id: photo?.public_id,
      url: photo?.secure_url,
    }
    const result = await prisma.userPhoto.update({
      where: {
        userId: user?.id,
      },
      data,
    })

    if (!result) {
      throw new Error(`Photo upload failed`)
    }
  } else {
    const photo = await cloudinary.v2.uploader.upload(payload, {
      folder: 'lms/user',
      width: 200,
    })

    const data: Partial<UserPhoto> = {
      userId: user?.id,
      public_id: photo?.public_id,
      url: photo?.secure_url,
    }

    const result = await prisma.userPhoto.create({
      // @ts-ignore
      data,
    })

    if (!result) {
      throw new Error(`Photo upload failed`)
    }
  }

  return user
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

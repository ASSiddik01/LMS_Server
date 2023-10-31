import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import routers from './app/routes'
import { globalError } from './middleware/globalError'
import { sendRes } from './utilities/sendRes'
import httpStatus from 'http-status'
import cookieParser from 'cookie-parser'
const app: Application = express()
import { v2 as cloudinary } from 'cloudinary'
import config from './config'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

// Middleware
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Data API
app.use('/api/v1', routers)

// Testing API
app.get('/', (req: Request, res: Response) => {
  sendRes(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '+++ App Running Successfully +++',
    data: null,
  })
})

// Global error handle
app.use(globalError)

// Unknown API Handle
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessage: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  })
  next()
})

export default app

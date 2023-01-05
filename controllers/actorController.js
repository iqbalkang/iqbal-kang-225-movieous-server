const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')
const { isValidObjectId } = require('mongoose')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'drfhleyrl',
  api_key: '688356598646278',
  api_secret: 'GLDcXVWIMVwA_Bjg5fpsWZg0Pvc',
})

const postActor = asyncHandler((req, res, next) => {
  const { name, about, gender } = req.body
  const image = req.file

  if (!name || !about || gender) return next(new AppError('Missing fields', StatusCodes.BAD_REQUEST))
})

module.exports = { postActor }

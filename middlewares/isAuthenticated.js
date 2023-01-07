const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/UserModel')

const isAuthenticated = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer'))
    return next(new AppError('Not authorized', StatusCodes.UNAUTHORIZED))

  const token = authHeader.split(' ')[1]

  const isVerified = jwt.verify(token, process.env.JWT_SECRET_KEY)
  if (!isVerified) return next(new AppError('Invalid token', StatusCodes.UNAUTHORIZED))

  const user = await User.findOne({ _id: isVerified.userId })
  if (!user) return next(new AppError('No user was found with that token', StatusCodes.UNAUTHORIZED))

  req.user = user
  next()
})

module.exports = isAuthenticated

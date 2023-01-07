const { StatusCodes } = require('http-status-codes')
const User = require('../models/UserModel')
const AppError = require('../utils/appError')

const isAdmin = async (req, res, next) => {
  const { isAdmin } = req.user
  console.log(req.user)
  if (isAdmin) return next()
  else next(new AppError('Not authorized as an admin', StatusCodes.UNAUTHORIZED))
}

module.exports = isAdmin

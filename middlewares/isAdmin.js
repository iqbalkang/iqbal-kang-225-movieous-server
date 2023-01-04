const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/appError')

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  else next(new AppError('Not authorized as an admin', StatusCodes.UNAUTHORIZED))
}

module.exports = isAdmin

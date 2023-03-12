const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const Movie = require('../models/MovieModel')
const AppError = require('../utils/AppError')
const Review = require('../models/ReviewModel')
const User = require('../models/UserModel')

const getCount = asyncHandler(async (req, res, next) => {
  const users = await User.countDocuments()
  const movies = await Movie.countDocuments()
  const reviews = await Review.countDocuments()

  res.status(StatusCodes.OK).json({
    status: 'success',
    info: { users, movies, reviews },
  })
})

module.exports = { getCount }

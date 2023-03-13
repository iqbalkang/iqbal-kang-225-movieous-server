const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const Movie = require('../models/MovieModel')
const AppError = require('../utils/AppError')
const Review = require('../models/ReviewModel')
const User = require('../models/UserModel')
const { topRatedMoviesPipeline, getAverageRatings } = require('../utils/aggregations')

const getCount = asyncHandler(async (req, res, next) => {
  const users = await User.countDocuments()
  const movies = await Movie.countDocuments()
  const reviews = await Review.countDocuments()

  res.status(StatusCodes.OK).json({
    status: 'success',
    info: { users, movies, reviews },
  })
})

const getMostRated = async (req, res) => {
  const movies = await Movie.aggregate(topRatedMoviesPipeline())

  const mapMovies = async m => {
    const reviews = await getAverageRatings(m._id)

    return {
      id: m._id,
      title: m.title,
      reviews: { ...reviews },
    }
  }

  const topRatedMovies = await Promise.all(movies.map(mapMovies))

  res.json({ movies: topRatedMovies })
}

module.exports = { getCount, getMostRated }

const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')
const Actor = require('../models/ActorModel')
const Movie = require('../models/MovieModel')
const User = require('../models/UserModel')
const Review = require('../models/ReviewModel')

const postReview = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params
  const { _id: userId } = req.user
  const { rating, comment } = req.body

  const movie = await Movie.findOne({ _id: movieId })
  if (!movie) return next(new AppError('no movie was found', StatusCodes.NOT_FOUND))

  const oldReview = await Review.findOne({ userId, movieId })
  if (oldReview) return next(new AppError('you have already reviewd this movie', StatusCodes.NOT_ACCEPTABLE))

  const review = new Review({ movieId, rating, comment, userId })
  await review.save()

  movie.reviews.push(review._id)
  await movie.save()

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'review was added successfully',
  })
})

const updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params
  const { _id: userId } = req.user
  const { rating, comment } = req.body

  const review = await Review.findOne({ _id: reviewId, userId })
  if (!review) return next(new AppError('no review was found', StatusCodes.NOT_FOUND))

  review.rating = rating
  review.comment = comment
  await review.save()

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'review was updated successfully',
  })
})

const deleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params
  const { _id: userId } = req.user

  const review = await Review.findOne({ _id: reviewId, userId })
  if (!review) return next(new AppError('no review was found', StatusCodes.NOT_FOUND))

  const movie = await Movie.findOne({ _id: review.movieId })
  if (!movie) return next(new AppError('no movie was found', StatusCodes.NOT_FOUND))

  console.log(movie.reviews)

  movie.reviews = movie.reviews.filter(revId => revId.toString() !== reviewId)
  await movie.save()

  await Review.findByIdAndDelete(reviewId)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'review was deleted successfully',
  })
})

const getMovieReviews = asyncHandler(async (req, res, next) => {
  // const { reviewId } = req.params
  // const { _id: userId } = req.user

  const { movieId } = req.params
  const movie = await Movie.findById(movieId)
    .populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        select: 'name',
      },
    })
    .select('reviews')
  // if (!movie) return next(new AppError('no movie was found', StatusCodes.NOT_FOUND))

  const formattedReviews = movie.reviews.map(review => {
    return {
      reviewId: review._id,
      rating: review.rating,
      comment: review.comment,
      user: {
        userId: review.userId._id,
        name: review.userId.name,
      },
    }
  })

  res.status(StatusCodes.OK).json({
    status: 'success',
    reviews: formattedReviews,
  })
})

module.exports = { postReview, updateReview, deleteReview, getMovieReviews }

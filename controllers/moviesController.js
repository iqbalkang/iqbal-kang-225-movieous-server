const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
// const { findByIdAndUpdate } = require('../models/MovieModel')
const Movie = require('../models/MovieModel')
const AppError = require('../utils/AppError')
const cloudinary = require('cloudinary').v2

const uploadTrailer = asyncHandler(async (req, res, next) => {
  const trailer = req.file
  if (!trailer) return next(new AppError('Please upload a trailer', StatusCodes.BAD_REQUEST))

  const result = await cloudinary.uploader.upload(trailer.path, {
    resource_type: 'video',
  })

  res.status(StatusCodes.OK).json({
    url: result.secure_url,
    public_id: result.public_id,
  })
})

const addMovie = asyncHandler(async (req, res, next) => {
  const poster = req.file
  const { genre, cast, tags, writers, trailer, director } = req.body
  console.log(req.body)
  const movie = new Movie(req.body)

  if (poster) {
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(poster.path, {
      transformation: { width: 1280, height: 720 },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    })

    movie.poster = { url, public_id, responsive: [] }

    const { breakpoints } = responsive_breakpoints[0]
    for (let breakpoint of breakpoints) {
      movie.poster.responsive.push(breakpoint.secure_url)
    }
  }

  // if (trailer) movie.trailer = trailer
  // if (cast) movie.cast = cast
  // if (tags) movie.tags = tags
  // if (writers) movie.writers = writers
  // if (genre) movie.genre = genre
  // if (director) movie.director = director
  // console.log(movie)
  await movie.save()
  res.status(StatusCodes.OK).json({
    status: 'success',
    movie,
  })
})

const updateMovie = asyncHandler(async (req, res, next) => {
  const poster = req.file
  const { movieId } = req.params
  const { genre, cast, tags, writers, trailer, director } = req.body

  // console.log(trailer)

  // const movie = await Movie.findById(movieId)
  // if (!movie) return next(new AppError('No movie was found', StatusCodes.BAD_REQUEST))
  // console.log(movie)

  const movie = await Movie.findByIdAndUpdate(movieId, req.body, { new: true, runValidators: true })
  if (!movie) return next(new AppError('No movie was found to update', StatusCodes.BAD_REQUEST))

  // console.log(poster)

  if (poster) {
    const { public_id: poster_id } = movie.poster
    if (poster_id) {
      const { result } = await cloudinary.uploader.destroy(poster_id)
      if (result !== 'ok') return next(new AppError('Could not delete the poster from cloud'))
    }

    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(poster.path, {
      transformation: { width: 1280, height: 720 },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    })

    movie.poster = { url, public_id, responsive: [] }
    const { breakpoints } = responsive_breakpoints[0]
    for (let breakpoint of breakpoints) {
      movie.poster.responsive.push(breakpoint.secure_url)
    }
  }

  if (trailer) movie.trailer = trailer
  // if (cast) movie.cast = cast
  // if (tags) movie.tags = tags
  // if (writers) movie.writers = writers
  // if (genre) movie.genre = genre
  // if (director) movie.director = director
  await movie.save()

  res.status(StatusCodes.OK).json({
    movie,
  })
})

const getMovies = asyncHandler(async (req, res, next) => {
  const { page, limit } = req.query

  const skip = +page * +limit

  const movies = await Movie.find({}).skip(skip).limit(+limit)
  if (!movies) return next(new AppError('No movies were found', StatusCodes.NOT_FOUND))

  res.status(StatusCodes.OK).json({
    len: movies.length,
    status: 'success',
    movies,
  })
})

const getMovie = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params

  const movie = await Movie.findById(movieId).populate('director writers cast.actor')
  console.log(movie)
  if (!movie) return next(new AppError('No movie was found', StatusCodes.NOT_FOUND))

  res.status(StatusCodes.OK).json({
    status: 'success',
    movie,
  })
})

const searchMovie = asyncHandler(async (req, res, next) => {
  const { title } = req.query
  // const actors = await Actor.find({ $text: { $search: `"${name}"` } })
  const movies = await Movie.find({ title: { $regex: title, $options: 'i' } })

  // const formattedResponse = actors.map(actor => actorResponse(actor))

  res.status(StatusCodes.OK).json({
    status: 'success',
    movies,
  })
})

module.exports = { addMovie, uploadTrailer, updateMovie, getMovies, getMovie, searchMovie }

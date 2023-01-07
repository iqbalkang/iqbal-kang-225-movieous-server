const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const { findByIdAndUpdate } = require('../models/MovieModel')
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

  await movie.save()

  res.status(StatusCodes.OK).json({
    movie,
  })
})

const updateMovie = asyncHandler(async (req, res, next) => {
  const poster = req.file
  const { movieId } = req.params
  const { genre, cast, tags, writers, trailer, director } = req.body

  // const movie = await Movie.findById(movieId)
  // if (!movie) return next(new AppError('No movie was found', StatusCodes.BAD_REQUEST))
  // console.log(movie)

  const movie = await Movie.findByIdAndUpdate(movieId, req.body)
  console.log(movie)

  // const movie = new Movie(req.body)
  // if (poster) {
  //   const {
  //     secure_url: url,
  //     public_id,
  //     responsive_breakpoints,
  //   } = await cloudinary.uploader.upload(poster.path, {
  //     transformation: { width: 1280, height: 720 },
  //     responsive_breakpoints: {
  //       create_derived: true,
  //       max_width: 640,
  //       max_images: 3,
  //     },
  //   })
  //   movie.poster = { url, public_id, responsive: [] }
  //   const { breakpoints } = responsive_breakpoints[0]
  //   for (let breakpoint of breakpoints) {
  //     movie.poster.responsive.push(breakpoint.secure_url)
  //   }
  // }
  // if (trailer) movie.trailer = trailer
  // if (cast) movie.cast = cast
  // if (tags) movie.tags = tags
  // if (writers) movie.writers = writers
  // if (genre) movie.genre = genre
  // if (director) movie.director = director
  // await movie.save()
  // res.status(StatusCodes.OK).json({
  //   movie,
  // })
})

module.exports = { addMovie, uploadTrailer, updateMovie }

const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
// const { findByIdAndUpdate } = require('../models/MovieModel')
const Movie = require('../models/MovieModel')
const AppError = require('../utils/AppError')
const cloudinary = require('cloudinary').v2
const actorResponse = require('../utils/actorResponse')
const Review = require('../models/ReviewModel')
const {
  averageRatingPipeline,
  topRatedMoviesPipeline,
  getAverageRatings,
  relatedMovieAggregation,
} = require('../utils/aggregations')

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

  // const movie = await Movie.findById

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

const getMovies = asyncHandler(async (req, res, next) => {
  const { page, limit } = req.query

  const skip = +page * +limit

  const movies = await Movie.find({}).skip(skip).limit(+limit).sort({ createdAt: -1 })
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
  if (!movie) return next(new AppError('No movie was found', StatusCodes.NOT_FOUND))

  const formattedResponse = () => {
    return {
      id: movie._id,
      title: movie.title,
      storyLine: movie.storyLine,
      tags: movie.tags,
      releaseDate: movie.releaseDate,
      type: movie.type,
      status: movie.status,
      language: movie.language,
      genre: movie.genre,
      writers: movie.writers.map(writer => actorResponse(writer)),
      director: actorResponse(movie.director),
      poster: movie.poster,
      cast: movie.cast.map(member => ({
        actor: actorResponse(member.actor),
        roleAs: member.roleAs,
        leadActor: member.leadActor,
      })),
    }
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    movie: formattedResponse(),
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

const deleteMovie = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params
  const movie = await Movie.findById(movieId)
  if (!movie) return next(new AppError('No movie was found.', StatusCodes.NOT_FOUND))

  const { public_id: poster_id } = movie.poster
  if (poster_id) {
    console.log(poster_id)
    const { result } = await cloudinary.uploader.destroy(poster_id)
    console.log(result)
    if (result !== 'ok') return next(new AppError('Could not delete the poster from cloud'))
  }

  const { public_id } = movie.trailer
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id, { resource_type: 'video' })
    if (result !== 'ok') return next(new AppError('Could not delete the trailer from cloud'))
  }

  await Movie.findByIdAndDelete(movieId)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'movie was successfully deleted',
  })
})

const getLatestMovies = asyncHandler(async (req, res, next) => {
  const { limit = 5 } = req.query

  const movies = await Movie.find({ status: 'public' }).limit(+limit).sort({ createdAt: -1 })
  if (!movies) return next(new AppError('No movies were found', StatusCodes.NOT_FOUND))

  res.status(StatusCodes.OK).json({
    status: 'success',
    movies: movies.map(movie => {
      const { _id, trailer, poster, title, storyLine } = movie
      return {
        movieId: _id,
        trailer: trailer?.url,
        poster: poster?.url,
        responsivePosters: poster.responsive,
        title,
        storyLine,
      }
    }),
  })
})

const getTopRatedMovies = async (req, res) => {
  const { type = 'Film' } = req.query

  const movies = await Movie.aggregate(topRatedMoviesPipeline(type))

  const mapMovies = async m => {
    const reviews = await getAverageRatings(m._id)

    return {
      id: m._id,
      title: m.title,
      poster: m.poster,
      responsivePosters: m.responsivePosters,
      reviews: { ...reviews },
    }
  }

  const topRatedMovies = await Promise.all(movies.map(mapMovies))

  res.json({ movies: topRatedMovies })
}

const getRelatedMovies = async (req, res) => {
  const { movieId } = req.params

  const movie = await Movie.findById(movieId)

  const movies = await Movie.aggregate(relatedMovieAggregation(movie.tags, movie._id))

  const mapMovies = async m => {
    const reviews = await getAverageRatings(m._id)

    return {
      id: m._id,
      title: m.title,
      poster: m.poster,
      responsivePosters: m.responsivePosters,
      reviews: { ...reviews },
    }
  }
  const relatedMovies = await Promise.all(movies.map(mapMovies))

  res.json({ movies: relatedMovies })
}

const getSingleMovie = async (req, res) => {
  const { movieId } = req.params
  const movie = await Movie.findById(movieId).populate('director writers cast.actor')

  const [aggregatedResponse] = await Review.aggregate(averageRatingPipeline(movie._id))

  const reviews = {}

  if (aggregatedResponse) {
    const { ratingAvg, reviewCount } = aggregatedResponse
    reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1)
    reviews.reviewCount = reviewCount
  }

  const {
    _id: id,
    title,
    storyLine,
    cast,
    writers,
    director,
    releaseDate,
    genre,
    tags,
    language,
    poster,
    trailer,
    type,
  } = movie

  res.json({
    movie: {
      id,
      title,
      storyLine,
      releaseDate,
      genre,
      tags,
      language,
      type,
      poster: poster?.url,
      trailer: trailer?.url,
      cast: cast.map(c => ({
        id: c._id,
        profile: {
          id: c.actor._id,
          name: c.actor.name,
          image: c.actor?.image?.url,
        },
        leadActor: c.leadActor,
        roleAs: c.roleAs,
      })),
      writers: writers.map(w => ({
        id: w._id,
        name: w.name,
      })),
      director: {
        id: director._id,
        name: director.name,
      },
      reviews: { ...reviews },
    },
  })
}

module.exports = {
  addMovie,
  uploadTrailer,
  updateMovie,
  getMovies,
  getMovie,
  searchMovie,
  deleteMovie,
  getLatestMovies,
  getTopRatedMovies,
  getRelatedMovies,
  getSingleMovie,
}

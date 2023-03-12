const express = require('express')
const {
  addMovie,
  uploadTrailer,
  updateMovie,
  getMovies,
  getMovie,
  searchMovie,
  deleteMovie,
  getLatestMovies,
  getSingleMovie,
  getTopRatedMovies,
  getRelatedMovies,
} = require('../controllers/moviesController')
const formDataParser = require('../middlewares/formDataParser')
const { uploadVideo, uploadImage } = require('../middlewares/upload')

// const isAuthenticated = require('../middlewares/isAuthenticated')
// const isAdmin = require('../middlewares/isAdmin')

const router = express.Router()

router.get('/lastest-uploads', getLatestMovies)
router.get('/single-movie/:movieId', getSingleMovie)
router.get('/top-rated', getTopRatedMovies)
router.get('/related-movies/:movieId', getRelatedMovies)

// admin routes
router.get('/', getMovies)
router.get('/search', searchMovie)
router.get('/:movieId', getMovie)
router.post('/', uploadImage.single('poster'), formDataParser, addMovie)
router.patch('/:movieId', uploadImage.single('poster'), formDataParser, updateMovie)
router.post('/upload-trailer', uploadVideo.single('trailer'), uploadTrailer)
router.delete('/:movieId', deleteMovie)

module.exports = router

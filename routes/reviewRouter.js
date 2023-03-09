const express = require('express')
const { postReview, updateReview, deleteReview, getMovieReviews } = require('../controllers/reviewsController')
const isAuthenticated = require('../middlewares/isAuthenticated')

const router = express.Router()

router.get('/:movieId', getMovieReviews)
router.post('/:movieId', isAuthenticated, postReview)
router.patch('/:reviewId', isAuthenticated, updateReview)
router.delete('/:reviewId', isAuthenticated, deleteReview)

module.exports = router

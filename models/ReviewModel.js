const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  movieId: {
    type: mongoose.Types.ObjectId,
    ref: 'Movie',
  },
})

module.exports = mongoose.model('Review', reviewSchema)

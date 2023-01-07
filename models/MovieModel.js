const mongoose = require('mongoose')
const genres = require('../utils/genres')

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    storyLine: {
      type: String,
      required: true,
    },
    director: {
      type: mongoose.Types.ObjectId,
      ref: 'Actor',
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['private', 'public'],
    },
    type: {
      type: String,
    },
    genre: {
      type: [String],
      required: true,
      enum: genres,
    },
    tags: {
      type: [String],
    },
    cast: [{ actor: { type: mongoose.Types.ObjectId, ref: 'Actor' }, roleAs: String, leadActor: Boolean }],
    writers: [{ type: mongoose.Types.ObjectId, ref: 'Actor' }],
    poster: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      responsive: [String],
    },
    trailer: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
    language: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Movie', movieSchema)

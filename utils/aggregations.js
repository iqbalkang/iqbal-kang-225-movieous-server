const Review = require('../models/ReviewModel')

exports.averageRatingPipeline = movieId => {
  return [
    {
      $lookup: {
        from: 'Review',
        localField: 'rating',
        foreignField: '_id',
        as: 'avgRat',
      },
    },
    {
      $match: { movieId: movieId },
    },
    {
      $group: {
        _id: null,
        ratingAvg: {
          $avg: '$rating',
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]
}

exports.relatedMovieAggregation = (tags, movieId) => {
  return [
    {
      $lookup: {
        from: 'Movie',
        localField: 'tags',
        foreignField: '_id',
        as: 'relatedMovies',
      },
    },
    {
      $match: {
        tags: { $in: [...tags] },
        _id: { $ne: movieId },
      },
    },
    {
      $project: {
        title: 1,
        poster: '$poster.url',
        responsivePosters: '$poster.responsive',
      },
    },
    {
      $limit: 5,
    },
  ]
}

exports.topRatedMoviesPipeline = type => {
  const matchOptions = {
    reviews: { $exists: true },
    status: { $eq: 'public' },
  }

  if (type) matchOptions.type = { $eq: type }

  return [
    {
      $lookup: {
        from: 'Movie',
        localField: 'reviews',
        foreignField: '_id',
        as: 'topRated',
      },
    },
    {
      $match: matchOptions,
    },
    {
      $project: {
        title: 1,
        poster: '$poster.url',
        responsivePosters: '$poster.responsive',
        reviewCount: { $size: '$reviews' },
      },
    },
    {
      $sort: {
        reviewCount: -1,
        // ratingAvg: 1,
      },
    },
    {
      $limit: 5,
    },
  ]
}

exports.getAverageRatings = async movieId => {
  const [aggregatedResponse] = await Review.aggregate(this.averageRatingPipeline(movieId))
  const reviews = {}

  if (aggregatedResponse) {
    const { ratingAvg, reviewCount } = aggregatedResponse
    reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1)
    reviews.reviewCount = reviewCount
  }

  return reviews
}

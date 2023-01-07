const formDataParser = (req, res, next) => {
  const { genre, tags, writers, cast, trailer, director } = req.body

  if (genre) req.body.genre = JSON.parse(genre)
  if (tags) req.body.tags = JSON.parse(tags)
  if (writers) req.body.writers = JSON.parse(writers)
  if (cast) req.body.cast = JSON.parse(cast)
  if (trailer) req.body.trailer = JSON.parse(trailer)

  next()
}

module.exports = formDataParser

const formDataParser = (req, res, next) => {
  const { genre, tags, writers, cast, trailer, director, poster } = req.body

  console.log(req.body)

  if (genre) req.body.genre = JSON.parse(genre)
  if (tags) req.body.tags = JSON.parse(tags)
  if (writers) req.body.writers = JSON.parse(writers)
  if (cast) req.body.cast = JSON.parse(cast)
  if (poster) req.body.poster = JSON.parse(poster)
  if (trailer) req.body.trailer = JSON.parse(trailer)
  // if (director) req.body.director = JSON.parse(director)

  next()
}

module.exports = formDataParser

const express = require('express')
const cors = require('cors')
const AppError = require('./utils/AppError')
const { StatusCodes } = require('http-status-codes')

const usersRouter = require('./routes/usersRouter')
const actorRouter = require('./routes/actorRouter')
const movieRouter = require('./routes/movieRouter')
const reviewRouter = require('./routes/reviewRouter')
const adminRouter = require('./routes/adminRouter')
const globalErrorHandler = require('./middlewares/globalErrorHandler')
// const isAuthenticated = require('./middlewares/isAuthenticated')
const path = require('path')

const app = express()

app.use(express.json())
app.use(cors())

// Production
app.use('/', express.static(path.join(__dirname, '../client/build')))

app.use('/api/v1/auth', usersRouter)
app.use('/api/v1/actor', actorRouter)
app.use('/api/v1/movie', movieRouter)
app.use('/api/v1/review', reviewRouter)
app.use('/api/v1/admin', adminRouter)

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND))
})

app.use(globalErrorHandler)

module.exports = app

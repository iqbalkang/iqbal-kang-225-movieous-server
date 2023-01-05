const express = require('express')
const cors = require('cors')
const AppError = require('./utils/AppError')
const { StatusCodes } = require('http-status-codes')

const usersRouter = require('./routes/usersRouter')
const actorRouter = require('./routes/actorRouter')
const globalErrorHandler = require('./middlewares/globalErrorHandler')
// const isAuthenticated = require('./middlewares/isAuthenticated')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/v1/auth', usersRouter)
app.use('/api/v1/actor', actorRouter)

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND))
})

app.use(globalErrorHandler)

module.exports = app

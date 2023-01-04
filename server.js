const app = require('./app')
const dotEnv = require('dotenv')
const connectDB = require('./utils/connectDB')

dotEnv.config()

const PORT = process.env.PORT || 8080
const MONGO_URI = process.env.MONGO_URI

const startServer = async () => {
  await connectDB(MONGO_URI)
  app.listen(PORT, () => console.log(`Listening on ${PORT}...`))
}

startServer()

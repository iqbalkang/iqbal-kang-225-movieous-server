const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const connectDB = async uri => {
  try {
    await mongoose.connect(uri)
    console.log('Connected to the database')
  } catch (error) {
    console.log(error)
  }
}

module.exports = connectDB

const mongoose = require('mongoose')

const passResetSchema = new mongoose.Schema({
  belongsTo: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

module.exports = mongoose.model('PassResetToken', passResetSchema)

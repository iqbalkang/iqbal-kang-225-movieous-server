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
    expireAfterSeconds: 3600,
    default: Date.now(),
  },
})

module.exports = mongoose.model('PassResetToken', passResetSchema)

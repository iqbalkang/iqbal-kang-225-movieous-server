const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const otpSchema = new mongoose.Schema({
  belongsTo: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expireAfterSeconds: 3600,
    default: Date.now(),
  },
})

otpSchema.pre('save', async function () {
  this.otp = await bcrypt.hash(this.otp, 12)
})

otpSchema.methods.compareOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otp)
}

module.exports = mongoose.model('OTP', otpSchema)

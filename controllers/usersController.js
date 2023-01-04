const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')
const User = require('../models/UserModel')
const OTP = require('../models/OTPModel')

const { isValidObjectId } = require('mongoose')
const sendMail = require('../utils/sendMail')
const generateOTP = require('../utils/generateOTP')

const postRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) return next(new AppError('Missing fields', StatusCodes.BAD_REQUEST))

  const oldUser = await User.findOne({ email })
  if (oldUser) return next(new AppError('Email is already in use', StatusCodes.BAD_REQUEST))

  const newUser = new User({ name, email, password })
  const user = await newUser.save()

  const otp = generateOTP()
  const newOTP = new OTP({ otp, belongsTo: user._id })
  await newOTP.save()

  const transport = sendMail()
  transport.sendMail({
    from: 'verification@movieous.com',
    to: user.email,
    subject: 'Email Verification',
    html: `<p>Your verification OTP </p>
           <h1> ${otp} </h1>
          `,
  })

  const token = user.createJWT(user._id)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user: {
      userId: user._id,
      token,
    },
    message: 'Please verify your email. OTP has been sent to your account.',
  })
})

const postLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) return next(new AppError('Missing fields', StatusCodes.BAD_REQUEST))

  const user = await User.findOne({ email })
  if (!user) return next(new AppError('Invalid credentials', StatusCodes.NOT_FOUND))

  const areEqual = await user.comparePasswords(password)
  if (!areEqual) return next(new AppError('Invalid credentials', StatusCodes.BAD_REQUEST))

  const token = user.createJWT(user._id)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user: { userId: user.user_id, name: user.name, email, token },
  })
})

const verifyUser = asyncHandler(async (req, res, next) => {
  const { userId, otp } = req.body

  if (!userId || !otp) return next(new AppError('Invalid otp', StatusCodes.BAD_REQUEST))

  if (!isValidObjectId(userId)) return next(new AppError('Invalid user id', StatusCodes.BAD_REQUEST))

  const user = await User.findById(userId)
  if (!user) return next(new AppError('No user was found', StatusCodes.BAD_REQUEST))

  if (user.isVerified) return next(new AppError('User is already verified', StatusCodes.BAD_REQUEST))

  const otpDB = await OTP.findOne({ belongsTo: userId })
  if (!otpDB) return next(new AppError('Bad request', StatusCodes.BAD_REQUEST))

  const areEqual = await otpDB.compareOTP(otp)
  if (!areEqual) return next(new AppError('Invalid otp', StatusCodes.BAD_REQUEST))

  user.isVerified = true
  await user.save()

  await OTP.findByIdAndDelete(otpDB._id)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
    },
    message: 'email has been verified.',
  })
})

module.exports = {
  postRegister,
  postLogin,
  verifyUser,
}

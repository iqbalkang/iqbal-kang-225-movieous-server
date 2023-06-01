const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')
const User = require('../models/UserModel')
const OTP = require('../models/OTPModel')
const PassReset = require('../models/PassResetModel')

const { isValidObjectId } = require('mongoose')
const sendMail = require('../utils/sendMail')
const generateOTP = require('../utils/generateOTP')
const crypto = require('crypto')
const OTPModel = require('../models/OTPModel')

const postRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body

  if (!name || !email || !password) return next(new AppError('Missing fields', StatusCodes.BAD_REQUEST))

  const oldUser = await User.findOne({ email })
  if (oldUser) return next(new AppError('Email is already in use', StatusCodes.BAD_REQUEST))

  const newUser = new User({ name, email, password, isAdmin })
  const user = await newUser.save()

  const otp = generateOTP()
  const newOTP = new OTP({ otp, belongsTo: user._id })
  const ot = await newOTP.save()

  const transport = sendMail()
  await transport.sendMail({
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
    message: 'Please verify your email. OTP has been sent to your account.',
    user: { userId: user._id, name: user.name, email, isAdmin: user.isAdmin, token, isVerified: user.isVerified },
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
    user: { userId: user._id, name: user.name, email, isAdmin: user.isAdmin, token, isVerified: user.isVerified },
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

  const token = user.createJWT(user._id)

  res.status(StatusCodes.OK).json({
    status: 'success',
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      token,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
    },
    message: 'email has been verified.',
  })
})

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body

  if (!email) return next(new AppError('Please provide an email.', StatusCodes.BAD_REQUEST))

  const user = await User.findOne({ email })
  if (!user) return next(new AppError('No user was found', StatusCodes.NOT_FOUND))

  const oldToken = await PassReset.findOne({ belongsTo: user._id })
  if (oldToken) return next(new AppError('Please check your email to change password', StatusCodes.BAD_REQUEST))

  const bufferString = crypto.randomBytes(30)
  const token = bufferString.toString('hex')

  const newToken = new PassReset({ belongsTo: user._id, token })
  await newToken.save()

  const link = `http:/localhost:3000/reset-password?token=${token}&user=${user._id}`

  const transport = sendMail()
  transport.sendMail({
    from: 'security@movieous.com',
    to: user.email,
    subject: 'Password Reset Link',
    html: `<p>Please click on the link below to change your password. This link is only valid for 1 hour</p>
           <a href='${link}'> Change password </a>
          `,
  })

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Please check your email to change the password',
  })
})

const verifyPasswordResetToken = asyncHandler(async (req, res, next) => {
  const { token, userId } = req.body

  if (!token || !userId) return next(new AppError('Bad request.', StatusCodes.BAD_REQUEST))

  const user = await User.findById(userId)
  if (!user) return next(new AppError('No user was found', StatusCodes.NOT_FOUND))

  const oldToken = await PassReset.findOne({ belongsTo: userId })
  if (!oldToken)
    return next(new AppError('This link has expired. Please make another request.', StatusCodes.BAD_REQUEST))
  req.token = token
  req.userId = userId
  next()
})

const verifyPasswordResetTokenResponse = (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Please enter a new password.',
  })
}

const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword, confirmPassword, userId } = req.body

  if (!newPassword || !confirmPassword) return next(new AppError('Please enter the passwords', StatusCodes.BAD_REQUEST))
  if (newPassword !== confirmPassword) return next(new AppError('Passwords do not match', StatusCodes.BAD_REQUEST))

  const user = await User.findById(userId)
  const doesMatch = await user.comparePasswords(newPassword)
  if (doesMatch) return next(new AppError('You cannot use an old password.', StatusCodes.BAD_REQUEST))

  user.password = newPassword
  await user.save()

  await PassReset.findOneAndDelete({ belongsTo: userId })

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Password changed successfully',
  })
})

const resendEmailVerificationToken = async (req, res, next) => {
  const { userId } = req.body

  const user = await User.findById(userId)
  if (!user) return res.json({ error: 'user not found!' })

  if (user.isVerified) return next(new AppError('User is already verified', StatusCodes.BAD_REQUEST))

  const alreadyHasToken = await OTPModel.findOne({
    belongsTo: userId,
  })

  if (alreadyHasToken)
    return next(new AppError('Only after one hour you can request for another token!', StatusCodes.BAD_REQUEST))

  const otp = generateOTP()

  const newEmailVerificationToken = new OTPModel({ belongsTo: user._id, otp })
  await newEmailVerificationToken.save()

  const transport = sendMail()

  transport.sendMail({
    from: 'verification@movieous.com',
    to: user.email,
    subject: 'Email Verification',
    html: `
      <p>You verification OTP</p>
      <h1>${otp}</h1>
    `,
  })

  res.json({
    message: 'New OTP has been sent to your registered email account.',
  })
}

module.exports = {
  postRegister,
  postLogin,
  verifyUser,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  verifyPasswordResetTokenResponse,
  resendEmailVerificationToken,
}

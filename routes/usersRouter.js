const express = require('express')
const {
  postRegister,
  verifyUser,
  postLogin,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  verifyPasswordResetTokenResponse,
  resendEmailVerificationToken,
} = require('../controllers/usersController')

const router = express.Router()

router.post('/register', postRegister)
router.post('/login', postLogin)
router.post('/verify-user', verifyUser)
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-password-token', verifyPasswordResetToken, verifyPasswordResetTokenResponse)
router.post('/reset-password', verifyPasswordResetToken, resetPassword)
router.post('/resend-token', resendEmailVerificationToken)

module.exports = router

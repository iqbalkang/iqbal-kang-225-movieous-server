const express = require('express')
const {
  postRegister,
  verifyUser,
  postLogin,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  verifyPasswordResetTokenResponse,
} = require('../controllers/usersController')

const router = express.Router()

router.post('/register', postRegister)
router.post('/login', postLogin)
router.post('/verify-user', verifyUser)
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-password-token', verifyPasswordResetToken, verifyPasswordResetTokenResponse)
router.post('/reset-password', verifyPasswordResetToken, resetPassword)

module.exports = router

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

// const isAuthenticated = require('../middlewares/isAuthenticated')
// const isAdmin = require('../middlewares/isAdmin')

const router = express.Router()

router.post('/register', postRegister)
router.post('/login', postLogin)
router.post('/verify-user', verifyUser)
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-password-token', verifyPasswordResetToken, verifyPasswordResetTokenResponse)
router.post('/reset-password', verifyPasswordResetToken, resetPassword)

module.exports = router

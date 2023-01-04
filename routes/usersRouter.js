const express = require('express')
const { postRegister, verifyUser, postLogin } = require('../controllers/usersController')

// const isAuthenticated = require('../middlewares/isAuthenticated')
// const isAdmin = require('../middlewares/isAdmin')

const router = express.Router()

router.post('/register', postRegister)
router.post('/login', postLogin)
router.post('/verify-user', verifyUser)

module.exports = router

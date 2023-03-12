const express = require('express')
const { getCount } = require('../controllers/adminController')

const isAuthenticated = require('../middlewares/isAuthenticated')
const isAdmin = require('../middlewares/isAdmin')

const router = express.Router()

router.get('/', isAuthenticated, isAdmin, getCount)

module.exports = router

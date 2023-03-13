const express = require('express')
const { getCount, getMostRated } = require('../controllers/adminController')

const isAuthenticated = require('../middlewares/isAuthenticated')
const isAdmin = require('../middlewares/isAdmin')

const router = express.Router()

router.get('/', isAuthenticated, isAdmin, getCount)
router.get('/most-rated', isAuthenticated, isAdmin, getMostRated)

module.exports = router

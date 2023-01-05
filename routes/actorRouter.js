const express = require('express')
const { postActor } = require('../controllers/actorController')
const upload = require('../middlewares/upload')

const router = express.Router()

router.post('/', upload.single('image'), postActor)

module.exports = router

const express = require('express')
const {
  postActor,
  updateActor,
  deleteActor,
  getActors,
  getSingleActor,
  getLatestActors,
  searchActor,
} = require('../controllers/actorController')
const { uploadImage } = require('../middlewares/upload')

const isAuthenticated = require('../middlewares/isAuthenticated')
const isAdmin = require('../middlewares/isAdmin')

const router = express.Router()

router.get('/latest', getLatestActors)
router.get('/', getActors)
router.get('/search', searchActor)
router.get('/:actorId', getSingleActor)
router.post('/', uploadImage.single('image'), postActor)
router.put('/:actorId', uploadImage.single('image'), updateActor)
router.delete('/:actorId', isAuthenticated, isAdmin, deleteActor)

module.exports = router

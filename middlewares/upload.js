const { StatusCodes } = require('http-status-codes')
const multer = require('multer')
const AppError = require('../utils/AppError')

const storage = multer.diskStorage({})

const fileFilterImage = (req, file, cb) => {
  if (!file.mimetype.startsWith('image'))
    return cb(new AppError('Only image files are supported', StatusCodes.BAD_REQUEST), false)

  cb(null, true)
}
const fileFilterVideo = (req, file, cb) => {
  if (!file.mimetype.startsWith('video'))
    return cb(new AppError('Only video files are supported', StatusCodes.BAD_REQUEST), false)

  cb(null, true)
}

const uploadImage = multer({ storage, fileFilter: fileFilterImage })
const uploadVideo = multer({ storage, fileFilter: fileFilterVideo })

module.exports = { uploadImage, uploadVideo }

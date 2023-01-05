const { StatusCodes } = require('http-status-codes')
const multer = require('multer')
const AppError = require('../utils/AppError')

const storage = multer.diskStorage({})

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image'))
    return cb(new AppError('Only image files are supported', StatusCodes.BAD_REQUEST), false)

  cb(null, true)
}

const upload = multer({ storage, fileFilter })

module.exports = upload

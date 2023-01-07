const cloudinary = require('cloudinary').v2
require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

const cloudinaryUpload = async path => {
  const result = await cloudinary.uploader.upload(path, {
    width: 500,
    height: 500,
    gravity: 'face',
    crop: 'thumb',
  })

  return { url: result.secure_url, public_id: result.public_id }
}

module.exports = cloudinaryUpload

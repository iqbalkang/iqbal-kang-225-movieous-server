const asyncHandler = require('express-async-handler')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')
const Actor = require('../models/ActorModel')
const cloudinaryUpload = require('../utils/cloudinaryUpload')
const cloudinary = require('cloudinary').v2

const actorResponse = actor => {
  const { name, about, image, gender } = actor

  return { actorId: actor._id, name, about, gender, image: image.url }
}

const getActors = asyncHandler(async (req, res, next) => {
  const { page, limit } = req.query

  const skip = +page * +limit

  const actors = await Actor.find({}).skip(skip).limit(+limit)
  if (!actors) return next(new AppError('Could not find any actor', StatusCodes.NOT_FOUND))

  const formattedResponse = actors.map(actor => actorResponse(actor))

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    actors: formattedResponse,
  })
})

const getSingleActor = asyncHandler(async (req, res, next) => {
  const { actorId } = req.params

  const actor = await Actor.findById(actorId)
  if (!actor) return next(new AppError('Could not find any actor', StatusCodes.NOT_FOUND))

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    actor: actorResponse(actor),
  })
})

const getLatestActors = asyncHandler(async (req, res, next) => {
  const actors = await Actor.find().sort({ createdAt: '-1' }).limit(10)
  if (!actors) return next(new AppError('Could not find any actor', StatusCodes.NOT_FOUND))

  const formattedResponse = actors.map(actor => actorResponse(actor))

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    actors: formattedResponse,
  })
})

const postActor = asyncHandler(async (req, res, next) => {
  const { name, about, gender } = req.body
  const image = req.file

  if (!name || !about || !gender) return next(new AppError('Missing fields', StatusCodes.BAD_REQUEST))

  const newActor = new Actor({ name, about, gender })

  if (image) {
    const { url, public_id } = await cloudinaryUpload(image.path)
    newActor.image = { url, public_id }
  }
  const actor = await newActor.save()

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    actor: actorResponse(actor),
  })
})

const updateActor = asyncHandler(async (req, res, next) => {
  const { name, about, gender } = req.body
  const { actorId } = req.params
  const image = req.file

  const actor = await Actor.findById(actorId)
  const { public_id } = actor.image

  actor.name = name
  actor.about = about
  actor.gender = gender

  if (image && public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id)
    if (result !== 'ok') next(new AppError('Could not delete the image from cloud.', StatusCodes.NOT_MODIFIED))
  }

  if (image) {
    const { url, public_id } = await cloudinaryUpload(image.path)
    actor.image = { url, public_id }
  }

  await actor.save()

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    actor: actorResponse(actor),
  })
})

const deleteActor = asyncHandler(async (req, res, next) => {
  const { actorId } = req.params

  const actor = await Actor.findById(actorId)
  if (!actor) return next(new AppError('No actor was found', StatusCodes.NOT_FOUND))
  const { public_id } = actor.image

  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id)
    if (result !== 'ok') return next(new AppError('Could not delete the image from cloud.', StatusCodes.NOT_MODIFIED))
  }

  await Actor.findByIdAndDelete(actorId)

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Actor deleted successfully',
  })
})

const searchActor = asyncHandler(async (req, res, next) => {
  const { name } = req.query
  const actors = await Actor.find({ $text: { $search: `"${name}"` } })

  res.status(StatusCodes.OK).json({
    status: 'success',
    actors,
  })
})

module.exports = { postActor, updateActor, deleteActor, searchActor, getActors, getLatestActors, getSingleActor }

const actorResponse = actor => {
  const { name, about, image, gender } = actor

  return { actorId: actor._id, name, about, gender, image: image.url }
}

module.exports = actorResponse

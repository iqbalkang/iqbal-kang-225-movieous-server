const { default: mongoose } = require('mongoose')
const mognoose = require('mongoose')

const actorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter actor's name"],
    },
    about: {
      type: String,
      required: [true, "Please enter actor's description"],
    },
    gender: {
      type: String,
      required: [true, "Please enter actor's gender"],
    },
    image: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
)

actorSchema.index({ name: 'text' })
module.exports = mognoose.model('Actor', actorSchema)

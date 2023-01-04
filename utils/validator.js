// const { body, validationResult } = require('express-validator')

// const validateRegisterInputs = [
//   body('email').not().isEmpty().withMessage('Please provide an email'),
//   body('email').normalizeEmail().isEmail('Please provide a valid emssail'),
// ]

// const validate = (req, res, next) => {
//   const error = validationResult(req).array()

//   if (error.length) {
//     return res.json({ error: error[0].msg })
//   }
//   next()
// }
// module.exports = { validateRegisterInputs, validate }

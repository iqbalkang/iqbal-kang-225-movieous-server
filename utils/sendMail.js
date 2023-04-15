const nodemailer = require('nodemailer')

const sendMail = () => {
  return (transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_USERNAME,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  }))
}

module.exports = sendMail

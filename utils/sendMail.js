const nodemailer = require('nodemailer')

const sendMail = () => {
  return (transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.SENDMAIL_USERNAME,
      pass: process.env.SENDMAIL_PASSWORD,
    },
  }))
}

module.exports = sendMail

const generateOTP = (OPT_LENGTH = 6) => {
  let OTP = ''
  for (let i = 0; i < OPT_LENGTH; i++) {
    OTP += Math.round(Math.random() * 9)
  }
  return OTP
}

module.exports = generateOTP

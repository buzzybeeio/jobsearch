const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
})

module.exports = {
  hash: str => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(str, 15, function (err, hash) {
        if (err) reject(err);
        else resolve(hash);
      })
    })
  },

  compare: (plainText, hash) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainText, hash, function (err, match) {
        if (err) reject(err);
        else resolve(match);
      })
    })
  },
  
  sendMail: mailOptions => {
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if(err) reject(err);
        else resolve(info);
      });
    })
  },

  randomString: () => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(35, (err, buffer) => {
        if (err) reject(err)
        else resolve(buffer.toString('base64').replace(/[=\/+]/g, ''))
      })
    })
  },
  
  genMail: (data, type, reciever) => {
    const email = {
      from: process.env.EMAIL,
      to: reciever
    }
    if (type === 'confirm') {
      email.subject = 'Confirm your buzzybee account'
      let URL = `https://www.buzzybee.io/verifyAccount/${data}`
      email.text = `Please go to this link ${URL} to confirm your account`
      email.html = `<b>Confirm your account!</b> <br/> Go <a href="${URL}">HERE</a> to confirm your account`
    } else if (type === 'resend confirm') {
      email.subject = 'Confirm your buzzybee account'
      let URL = `https://www.buzzybee.io/verifyAccount/${data}`
      email.text = `Please go to this link ${URL} to confirm your account`
      email.html = `<b>Confirm your account!</b> <br/> Go <a href="${URL}">HERE</a> to confirm your account <br/> Sorry for the trouble!`
    } else {
      email.subject = 'Your new password'
      email.text = `This is your new password: ${data}`
      email.html = `Your new password is: <br/> <b>${data}</b>`
    }
  
    return email
  }
}
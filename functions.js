const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { EMAIL, PASS } = require('./config/env')

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASS,
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
        else resolve(buffer.toString('base64'))
      })
    })
  },
  
  genMail: (data, type, recieverEmail, recieverName) => {
    const email = {
      from: EMAIL,
      to: recieverEmail
    }
    if (type === 'confirm') {
      email.subject = `Confirm your buzzybee account ${recieverName}!`
      let URL = `https://www.buzzybee.io/verifyAccount/${data}`
      email.text = `Please go to this link ${URL} to confirm your account`
      email.html = `<b>Confirm your account!</b> <br/> Go <a href="${URL}">HERE</a> to confirm your account`
    } else if (type === 'resend confirm') {
      email.subject = `Confirm your buzzybee account ${recieverName}!`
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
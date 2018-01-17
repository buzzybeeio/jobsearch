const router = require('express').Router()
const users = require('../database/mongoose').users
const vURL = require('../database/mongoose').vURL
const { compare, hash, sendMail, randomString, genMail } = require('../functions')
const nodemailer = require('nodemailer')
const passport = require('passport')
const { sign } = require('jsonwebtoken')
const { secret } = require('../config/env')

router.post('/register', (req, res) => {
  req.checkBody('firstName', 'The first name field can\'t be empty').notEmpty()
  req.checkBody('username', 'The Username field can\'t be empty').notEmpty()
  req.checkBody('username', 'Username has to be alphanumerical').isAlphanumeric()
  req.checkBody('email', 'Invalid email').isEmail()
  req.checkBody('email2', 'Both emails have to be the same').equals(req.body.email)
  req.checkBody('password2', 'Both password fields have to have the same value').equals(req.body.password)
  req.checkBody('password', 'Your password has to be at least 10 characters long').isLength({ min: 10 })
  req.checkBody('password', 'Your password has to have at least: 1 lower case english letter, 1 upper case english letter and 1 number').matches(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])/)

  const errors = req.validationErrors()
  if (errors) {
    res.json(errors.map(err => err.msg))
  } else {
    users.findUserForRegister(req.body).exec()
      .then(existingUser => {
        //Checking if the Email or Username is taken
        if (existingUser) {
          let error
          if (existingUser.email == req.body.email) {
            error = 'Email is taken'
          } else {
            error = 'Username is taken'
          }
          res.json([error])
        } else {
          //Saving user
          const b = req.body
          const newUser = new users({
            firstName: b.firstName,
            lastName: b.lastName,
            username: b.username,
            email: b.email,
            password: b.password,
            SignupDate: Date.now()
          });
          newUser.save().then(({ _id }) => {
            const verifyDoc = new vURL({ user: _id })

            //saving the doc
            verifyDoc.save().then(doc => {
              //sending the verification email
              const mailOptions = genMail(doc._id, 'confirm', b.email, b.firstName)
              sendMail(mailOptions)
                .then(() => res.success('Success!, now verify your email! \n Remember: Our email might be classified as "spam"'))
                .catch(res.fnError('R01')) // sendMail catch
            }).catch(res.fnError('R02')) // verifyDoc.save catch
            // newUser.save catch
          }).catch(err => {
            console.log(err.message)
            if (err.message == 'h') {
              res.error('R00') // error while hashing
            } else {
              res.error('R03') // error while saving user
            }
          })
        }
      }).catch(res.fnError('R04')) // findUserForRegister catch
  }
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, other) => {
    if(error) res.fnError(other)(error)
    else if(user) res.json(user)
    else res.json(other)
  })(req, res, next)
})

router.post('/verifyAccount', (req, res) => {
  if (!req.body.string) {
    res.error('V00')
  } else {
    //Looking for the URL
    vURL.findById(req.body.string).populate('user').exec()
      .then(doc => {
        if (doc) {
          if (doc.user) {
            //if the user exists verify it
            users.findByIdAndVerify(doc.user._id).exec()
              .then(() => {
                //once the user has been verified, remove the url from the database
                vURL.findByIdAndRemove(doc._id).exec().then(() => {
                  res.success('Your account was verified, now try to login!')
                }).catch(res.fnError('V01')) // vURL.findByIdAndRemove catch
              }).catch(res.fnError('V02')) // users.findByIdAndVerify catch

          } else {
            //if the user doesn't exist remove the URL from the database
            vURL.findByIdAndRemove(doc._id).exec()
              .then(() => {
                res.json(['There was an error, that user no longer exists'])
              }).catch(res.fnError('V03'))
          }

        } else {
          //if the url isn't on the database
          res.json(['This URL isn\'t valid, please confirm if your account is already verified by logging in'])
        }
      }).catch(res.fnError('V04')) // vURL.findById catch
  }
})

router.post('/forgotPassword', (req, res) => {
  //Finding a verrified user
  users.findUser(req.body.string).exec()
    .then(user => {
      if (!user) {
        //If no user found
        res.json(['Wrong email or username'])
      } else {
        randomString().then(newPass => {
          hash(newPass)
            .then(hash => {
              users.findByIdAndUpdate(user._id, { password: hash }).exec()
                .then(() => {
                  //sending email
                  const mailOptions = genMail(newPass, 'newPassword', user.email)
                  sendMail(mailOptions)
                    .then(() => {
                      res.success('Success!, you password was modified, the new password was sent to your email')
                    }).catch(res.fnError('FP01')) // sendMail catch
                }).catch(res.fnError('FP02')) // findByIdAndUpdate catch
            }).catch(res.fnError('FP00')) // hash catch
        }).catch(res.fnError('FP03')) // randomString catch
      }
    }).catch(res.fnError('FP04')) // findUser catch
})

router.post('/resendVerificationEmail', (req, res) => {
  users.findUnverifiedUser(req.body.string).exec()
    .then(user => {
      if (!user) {
        res.json([
          `User not found\n
            If you didn't get error R01 from the registration phase try following this next steps:\n
            1) try to login to see if your user is already verified\n
            2) If you can\'t login try using the "I Forgot my password" button\n
            3) If you get "Wrong email or username", ask for a resend of the verification again (remember to verify if you used the right username / email)\n
            If you keep getting an error, try to contact us`
        ])
      } else {
        vURL.findOne({ user: user._id }).exec()
          .then(doc => {
            if (!doc) {
              res.json(['Hey!, looks like you may have gotten error R02 while registering, contact us please!, send us an email at info@buzzybee.io'])
            } else {
              //sending email
              const mailOptions = genMail(doc._id, 'confirm', user.email, user.firstName)
              sendMail(mailOptions)
                .then(() => res.success('Success!, now verify your email! \n Remember: Our email might be classified as "spam"'))
                .catch(res.fnError('RVE00')) // sendMail catch
            }
          }).catch(res.fnError('RVE01')) // vURL.findOne catch
      }
    }).catch(res.fnError('RVE02')) // findUnverifiedUser catch
})

router.post('/changePassword', (req, res) => {
  req.checkBody('username', 'Username is empty').notEmpty()
  req.checkBody('currentPassword', 'Current password field cannot be empty').notEmpty()
  req.checkBody('password', 'New Password field can\'t be empty').notEmpty()
  req.checkBody('password2', 'Both new password fields have to have the same value').equals(req.body.password)
  req.checkBody('password', 'Your new password has to be at least 10 characters long').isLength({ min: 10 })
  req.checkBody('password', 'Your new password has to have at least: 1 lower case english letter, 1 upper case english letter and 1 number').matches(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])/)

  const errors = req.validationErrors()
  if (errors) {
    res.json(errors.map(err => err.msg))
  } else {
    users.findOne({ username: req.body.username }).exec()
      .then(user => {
        if (!user) {
          res.error('CP00') // If the user is not found
        } else {
          compare(req.body.currentPassword, user.password)
            .then(match => {
              if (!match) {
                res.json(['Wrong password'])
              } else {
                hash(req.body.password).then(hash => {
                  users.findByIdAndUpdate(user._id, { password: hash }).exec()
                    .then(() => res.success('Success!, you changed your password!'))
                    .catch(res.fnError('CP03')) // findByIdAndUpdate catch
                }).catch(res.fnError('CP02')) // hash catch
              }
            }).catch(res.fnError('CP01')) // compare catch
        }
      }).catch(res.fnError('CP04')) // findOne catch
  }
})

module.exports = router
const router = require('express').Router()
const users = require('../database/mongoose').users
const vURL = require('../database/mongoose').vURL
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

router.post('/register', (req, res) => {
  req.checkBody('firstName', 'The first name field can\'t be empty').notEmpty()
  req.checkBody('username', 'The Username field can\'t be empty').notEmpty()
  req.checkBody('username', 'Username has to be alphanumerical').isAlphanumeric()
  req.checkBody('email', 'Invalid email').isEmail()
  req.checkBody('email2', 'Both emails have to be the same').equals(req.body.email)
  req.checkBody('password', 'Password field can\'t be empty').notEmpty()
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
            //Verification proccess
            const verifyDoc = new vURL({ user: _id })

            //saving the doc
            verifyDoc.save().then(doc => {
              const URL = `https://www.buzzybee.io/verifyAccount/${doc._id}`
              const mailOptions = {
                from: process.env.EMAIL,
                to: b.email, // reciever
                subject: 'Confirm your buzzybee account',
                text: `Please go to this link ${URL} to confirm your account`, // plain text body
                html: `<b>Confirm your account!</b> <br/> Go <a href="${URL}">HERE</a> to confirm your account` // html body
              };

              //sending the email
              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.log(err.message);
                  res.error('R01')
                } else {
                  res.success('Success!, now verify your email! \n Remember: Our email might be classified as "spam"');
                }
              });

            }).catch(err => {
              console.log(err.message)
              res.error('R02')
            })
          }).catch(err => {
            console.log(err.message)
            if (err.message == 'h') {
              res.error('R00')
            } else {
              res.error('R03')
            }
          })
        }
      }).catch(err => {
        console.log(err.message)
        res.error('R04')
      })
  }
})

router.post('/login', (req, res) => {
  //Finding a verrified user
  users.findUser(req.body.string).exec()
    .then(user => {
      if (!user) {
        //If no user found
        res.json(['Wrong email, username or password'])
      } else {
        //comparing hash and password
        bcrypt.compare(req.body.password, user.password, (err, match) => {
          if (err) {
            //error while comparing hash and password
            console.log(err.message)
            res.error('L00')
          } else if (match) {
            //If the password matches the hash send the data
            res.json({
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            })
          } else {
            //If the password doesn't match the hash
            res.json(['Wrong email, username or password'])
          }
        })
      }
    }).catch(err => {
      console.log(err.message)
      //Error while trying to find the user
      res.error('L01')
    })
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
                }).catch(err => {
                  console.log(err)
                  res.error('V01')
                })
              }).catch(err => {
                //catch for verify
                console.log(err)
                res.error('V02')
              })
          } else {
            //if the user doesn't exist remove the URL from the database
            vURL.findByIdAndRemove(doc._id).exec()
              .then(() => {
                res.json(['There was an error, that user no longer exists'])
              }).catch(err => {
                console.log(err)
                res.error('V03')
              })
          }
        } else {
          //if the url isn't on the database
          res.json(['This URL isn\'t valid, please confirm if your account is already verified by logging in'])
        }
      }).catch(err => {
        //catch for vURL.findById
        console.log(err)
        res.error('V04')
      })
  }
})

function randomString() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(35, (err, buffer) => {
      if (err) reject(err)
      else resolve(buffer.toString('base64').replace(/[=\/+]/g, ''))
    })
  })
}

router.post('/forgotPassword', (req, res) => {
  //Finding a verrified user
  users.findUser(req.body.string).exec()
    .then(user => {
      if (!user) {
        //If no user found
        res.json(['Wrong email or username'])
      } else {
        randomString().then(newPass => {
          const mailOptions = {
            from: process.env.EMAIL,
            to: user.email, // reciever
            subject: 'Your new password',
            text: `This is your new password: ${newPass}`, // plain text body
            html: `Your new password is: <br/> <b>${newPass}</b>` // html body
          }

          bcrypt.hash(newPass, 15, function (err, hash) {
            if (err) {
              console.log(err.message)
              res.error('FP00')
            } else {
              users.findByIdAndUpdate(user._id, { password: hash }).exec()
                .then(() => {
                  transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                      console.log(err.message)
                      res.error('FP01')
                    } else {
                      res.success('Success!, you password was modified, the new password was sent to your email')
                    }
                  })
                }).catch(err => {
                  console.log(err.message)
                  res.error('FP02')
                })
            }
          })
        }).catch(err => {
          console.log(err.message)
          res.errror('FP03')
        })
      }
    }).catch(err => {
      console.log(err.message)
      //Error while trying to find the user
      res.error('FP04')
    })
})

router.post('/resendVerificationEmail', (req, res) => {
  users.findUnverifiedUser(req.body.string).exec()
    .then(user => {
      if (!user) {
        res.json([
          `User not found
            If you didn't get error R01 from the registration phase try following this next steps: 
            1) try to login to see if your user is already verified
            2) If you can\'t login try using the "I Forgot my password" button
            3) If you get "Wrong email or username", ask for a resend of the verification again (remember to verify if you used the right username / email)
            If you keep getting an error, try to contact us`
        ])
      } else {
        vURL.findOne({ user: user._id }).exec()
          .then(doc => {
            if (!doc) {
              res.json(['Hey!, looks like you may have gotten error R02 while registering, contact us please!, send us an email at info@buzzybee.io'])
            } else {
              const URL = `https://www.buzzybee.io/verifyAccount/${doc._id}`
              const mailOptions = {
                from: process.env.EMAIL,
                to: user.email, // reciever
                subject: 'Confirm your buzzybee account',
                text: `Please go to this link ${URL} to confirm your account`, // plain text body
                html: `<b>Confirm your account!</b> <br/> Go <a href="${URL}">HERE</a> to confirm your account <br/> Sorry for the trouble!` // html body
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.log(err.message);
                  res.error('RVE00')
                } else {
                  res.success('Success!, now verify your email! \n Remember: Our email might be classified as "spam"');
                }
              });
            }
          }).catch(err => {
            console.log(err.message)
            res.error('RVE01')
          })
      }
    }).catch(err => {
      console.log(err.message)
      res.error('RVE02')
    })
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
          res.error('CP00')
        } else {
          bcrypt.compare(req.body.currentPassword, user.password, function (err, match) {
            if (err) {
              console.log(err.message)
              res.error('CP01')
            } else if (!match) {
              res.json(['Wrong password'])
            } else {
              bcrypt.hash(req.body.password, 15, function (err, hash) {
                if (err) {
                  console.log(err.message)
                  res.error('CP02')
                } else {
                  users.findByIdAndUpdate(user._id, { password: hash }).exec()
                    .then(() => {
                      res.success('Success!, you changed your password!')
                    }).catch(err => {
                      console.log(err.message)
                      res.error('CP03')
                    })
                }
              })
            }
          })
        }
      }).catch(err => {
        console.log(err.message)
        res.error('CP0')
      })
  }
})

module.exports = router
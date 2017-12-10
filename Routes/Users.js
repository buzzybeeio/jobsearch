const router = require('express').Router()
const users = require('../database/mongoose').users
const vURL = require('../database/mongoose').vURL
const prURL = require('../database/mongoose').prURL
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

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
    res.json(errors)
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
          res.json({ error })
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
                from: 'trialguest268@gmail.com', // sender address
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
                  res.json({ success: 'Success!, now verify your email! \n Remember: Our email might be classified as "spam"' });
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
  users.findUserForLogin(req.body.string).exec()
    .then(user => {
      if (!user) {
        //If no user found
        res.json({ error: 'Wrong email, username or password' })
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
            res.json({ error: 'Wrong email, username or password' })
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
                  res.json({ success: 'Your account was verified, now try to login!' })
                }).catch(err => {
                  console.log(err)
                  res.error('V01')
                })
              })
              .catch(err => {
                //catch for verify
                console.log(err)
                res.error('V02')
              })
          } else {
            //if the user doesn't exist remove the URL from the database
            vURL.findByIdAndRemove(doc._id).exec()
              .then(() => {
                res.json({ error: 'There was an error, that user no longer exists' })
              }).catch(err => {
                console.log(err)
                res.error('V03')
              })
          }
        } else {
          //if the url isn't on the database
          res.json({ error: 'This URL isn\'t valid, please confirm if your account is already verified by logging in' })
        }
      })
      .catch(err => {
        //catch for vURL.findById
        console.log(err)
        res.error('V04')
      })
  }
})

module.exports = router
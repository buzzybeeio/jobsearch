const router = require('express').Router()
const users = require('../database/mongoose').users
const vURL = require('../database/mongoose').vURL
const prURL = require('../database/mongoose').prURL
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

const randomString = () => {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 50; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

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
    users.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] }).exec()
      .then(data => {
        //Checking if the Email or Username is taken
        if (data) {
          let error
          if (data.email == req.body.email) {
            error = 'Email is taken'
          } else {
            error = 'Username is taken'
          }
          res.json({ error })
        } else {
          //If neither were taken proceeding to hash password
          bcrypt.hash(req.body.password, 15, function (err, hash) {
            if (err) {
              console.log(err)
              res.json({ error: 'There was an error, try again later! \n error: R00' })
            } else {
              //Saving user
              const b = req.body
              const newUser = new users({
                firstName: b.firstName,
                lastName: b.lastName,
                username: b.username,
                email: b.email,
                password: hash,
                SignupDate: Date.now()
              });
              newUser.save().then(({ _id }) => {
                //Verification proccess
                const URL = `https://www.buzzybee.io/verifyAccount/${randomString()}`
                const verifyDoc = new vURL({ URL, user: _id })

                //saving the doc
                verifyDoc.save().then(() => {
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
                      console.log(err);
                      res.json({ error: 'There was an error, try again later! \n error: R01' });
                    } else {
                      res.json({ success: 'Success!, now verify your email! \n Remember: Our email might be classified as "spam"' });
                    }
                  });

                }).catch(err => {
                  console.log(err)
                  res.json({ error: 'There was an error, try again later! \n error: R02' })
                })
              }).catch(err => {
                console.log(err)
                res.json({ error: 'There was an error, try again later! \n error: R03' })
              })
            }
          });
        }
      }).catch(err => {
        console.log(err)
        res.json({ error: 'There was an error, try again later! \n error: R04' })
      })
  }
})

router.post('/login', (req, res) => {
  //Finding a verrified user
  users.findOne({
    verified: true,
    $or: [{ email: req.body.string }, { username: req.body.string }]
  }).select('password username firstName lastName email').exec()
    .then(result => {
      if (!result) {
        //If no user found
        res.json({ error: 'Wrong email, username or password' })
      } else {
        const { password } = result
        //comparing hash and password
        bcrypt.compare(req.body.password, password, (err, match) => {
          if (err) {
            //error while hashing
            console.log(err)
            res.json({ error: 'There was an error, try again later! \n err: L00' })
          } else if (match) {
            //If the password matches the hash send the data
            res.json({
              username: result.username,
              email: result.email,
              firstName: result.firstName,
              lastName: result.lastName
            })
          } else {
            //If the password doesn't match the hash
            res.json({ error: 'Wrong email, username or password' })
          }
        })
      }
    }).catch(err => {
      console.log(err)
      //Error while trying to find the user
      res.json({ error: 'There was an error, try again later! \n error: L01' })
    })
})

router.post('/verifyAccount', (req, res) => {
  req.checkBody('string', 'There is no String').notEmpty()

  const error = req.validationErrors()[0]

  if (error) {
    console.log(error)
    res.json({ error: 'There was an error, try again later! \n error: V00' })
  } else {
    //Looking for the URL
    vURL.findOne({ URL: req.body.string }).exec()
      .then(doc => {
        if (doc) {
          //if the url exists look for the user
          users.findById(doc.user).exec()
            .then(usr => {
              if (usr) {
                //if the user exists update it
                users.findByIdAndUpdate(doc.user, { verified: true, verificationDate: Date.now() }).exec()
                  .then(() => {
                    //once the user has been verified, remove the url from the database
                    vURL.findByIdAndRemove(doc._id).exec().then(() => {
                      res.json({ success: 'Your account was verified, now try to login!' })
                    }).catch(err => {
                      console.log(err)
                      res.json({ error: 'There was an error, try again later! \n error: V01' })
                    })
                  })
                  .catch(err => {
                    console.log(err)
                    res.json('There was an error, try again later! \n error: V02')
                  })
              } else {
                //if the user doesn't exist remove the URL from the database
                vURL.findByIdAndRemove(doc._id).exec().then(() => {
                  res.json({ error: 'There was an error, that user no longer exists' })
                }).catch(err => {
                  console.log(err)
                  res.json({ error: 'There was an error, try again later! \n error: V03' })
                })
              }
            })
            .catch(err => {
              console.log(err)
              res.json({ error: 'There was an error, try again later! \n error: V04' })
            })
        } else {
          //if the url isn't on the database
          res.json({ error: 'This URL isn\'t valid, please confirm if your account is already verified by logging in' })
        }
      })
      .catch(err => {
        console.log(err)
        res.json({ error: 'There was an error, try again later! \n error: V05' })
      })
  }
})

module.exports = router
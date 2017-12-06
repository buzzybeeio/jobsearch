const router = require('express').Router()
const users = require('../database/mongoose').users
const bcrypt = require('bcrypt')

router.post('/register', (req, res) => {
  req.checkBody('firstName', 'The first name field can\'t be empty').notEmpty()
  req.checkBody('username', 'The Username field can\'t be empty').notEmpty()
  req.checkBody('username', 'Username has to be alphanumerical').isAlphanumeric()
  req.checkBody('email', 'Invalid email').isEmail()
  req.checkBody('email2', 'Both emails have to be the same').equals(req.body.email)
  req.checkBody('password', 'Password field can\'t be empty').notEmpty()
  req.checkBody('password2', 'Both password fields have to have the same value').equals(req.body.password)

  const errors = req.validationErrors()
  if (errors) {
    res.json(errors)
  } else {
    users.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
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
              res.json({ error: 'There was an error, try again later!' })
            } else {
              //Saving user
              const b = req.body
              const newUser = new users({
                firstName: b.firstName,
                lastName: b.lastName,
                username: b.username,
                email: b.email,
                password: hash,
                jobs: []
              });
              newUser.save().then(() => {
                res.json({ success: 'Success!, now try to login' })
              }).catch(err => {
                console.log(err)
                res.json({ error: 'There was an error, try again later!' })
              })
            }
          });
        }
      }).catch(err => {
        console.log(err)
        res.json({ error: 'There was an error, try again later!' })
      })
  }
})

router.post('/login', (req, res) => {
  users.findOne({ $or: [{ email: req.body.string }, { username: req.body.string }] })
    .then(result => {
      if (!result) {
        res.json({ error: 'Wrong email, username or password' })
      } else {
        const { password } = result
        bcrypt.compare(req.body.password, password, (err, match) => {
          if (err) {
            console.log(err)
            res.json({ error: 'There was an error, try again later!' })
          } else if (match) {
            res.json({
              username: result.username,
              email: result.email,
              firstName: result.firstName,
              lastName: result.lastName,
              jobs: result.jobs
            })
          } else {
            res.json({ error: 'Wrong email, username or password' })
          }
        })
      }
    }).catch(err => {
      console.log(err)
      res.json({ error: 'There was an error, try again later!' })
    })
})

router.post('/PasswordLost', (req, res) => {

})

module.exports = router
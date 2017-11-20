const router = require('express').Router()
const users = require('../database/mongoose').users
const bcrypt = require('bcrypt')

router.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, 15, (err, hash) => {
    if (err) {
      console.log(err)
      res.json({ err: true })
    } else {
      const object = {
        name: req.body.name,
        password: hash,
        email: req.body.email,
        jobs: []
      }
      users.findOne({ email: object.email })
        .then(result => {
          if (result) {
            res.json({ err: true, errMessage: 'Email Taken' })
          } else {
            users.save(object)
              .then(() => res.json({ err: false }))
              .catch(() => res.json({ err: true }))
          }
        })
        .catch(() => res.json({ err: true }))
    }
  })
})

router.post('/login', (req, res) => {
  users.findOne({ email: req.body.email })
    .then(result => {
      if (result) {
        bcrypt.compare(req.body.password, result.password, (err, res) => {
          if (err) {
            res.json({ err: true })
          } else if (res) {
            const response = {
              name: result.name,
              jobs: result.jobs
            }
            res.json(response)
          } else {
            res.json({ err: true, errMessage: 'Wrong email or password' })
          }
        })
      } else {
        res.json({ err: true, errMessage: 'Wrong email or password' })
      }
    })
    .catch(() => res.json({ err: true }))
})
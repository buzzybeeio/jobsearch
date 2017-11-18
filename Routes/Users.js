const router = require('express').Router()
const users = require('../database/mongoose').users
const bcrypt = require('bcrypt')

router.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, 15, (err, hash) => {
    if(err){
      console.log(err)
      res.json({ err: true })
    } else {
      const object = { 
        name: req.body.name,
        password: hash,
        email: req.body.email,
        jobs: []
      }
      users.findOne({ name: object.name, email: object.email})
        .then(result => {
          if(result) {
            res.json({ err: true, errMessage: 'Username or email Taken'})
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
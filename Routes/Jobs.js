const router = require('express').Router()
const jobs = require('../database/mongoose').jobs

router.get('/', (req, res) => {
  jobs.find({}, null, { sort: '-datepost', limit: 50 })
    .then(docs => res.json(docs))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

module.exports = router

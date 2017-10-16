const router = require('express').Router()
const jobs = require('../database/mongoose').jobs
const indeed = require('../data-resources/indeed').custom
const authenticJobs = require('../data-resources/authenticjobs').custom

router.get('/', (req, res) => {
  jobs.find({}, null, { sort: '-datepost', limit: 50 })
    .then(docs => res.json(docs))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

router.post('/', (req, res) => {
  Promise.all([
    indeed(req.body.keywords, req.body.place),
    authenticJobs(req.body.keywords, req.body.place)
  ])
  .then(data => {
    const jobs = [].concat(...data)
    jobs.sort((a, b) => b.datepost - a.datepost)
    res.json(jobs)
  })
  .catch(() => {
    res.json({})
  })
})

module.exports = router

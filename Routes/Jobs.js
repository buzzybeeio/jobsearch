const router = require('express').Router()
const jobs = require('../database/mongoose').jobs
const indeed = require('../data-resources/indeed').custom
const authenticJobs = require('../data-resources/authenticjobs').custom

router.get('/', (req, res) => {
  keywords = ['developer', 'javascript', 'react', 'python', 'django', 'software', 'engineer', 'web', 'startup']
  const criteria = {
    $or: keywords.map(word => ({ title: { $regex: word, $options: 'i' } }))
  }

  jobs.find(criteria, null, { sort: '-datepost', limit: 75 })
    .then(docs => res.json(docs))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

router.post('/', (req, res) => {
  const criteria = {
    $or: req.body.keywords.map(word => ({ title: { $regex: word, $options: 'i' } }))
  }

  const cityRegExp = new RegExp(`${req.body.place.city.replace(' ', '\\s?')}`, 'gi')

  criteria.location = { $regex: cityRegExp }

  jobs.find(criteria, null, { sort: '-datepost', limit: 75 })
    .then(docs => {
      if (docs.length < 25) {

        Promise.all([
          indeed(req.body.keywords, req.body.place),
          authenticJobs(req.body.keywords, req.body.place)
        ])
          .then(data => {
            const found_jobs = [].concat(...data)
            found_jobs.sort((a, b) => b.datepost - a.datepost)

            found_jobs.forEach(job => {
              jobs.findOneAndUpdate(job, job, { upsert: true })
                .catch(err => {
                  if (err) {
                    console.log(`error saving job "${title}"`)
                  }
                })
            })

            res.json(found_jobs)
          })
          .catch(() => {
            res.json(docs)
          })

      }

      else res.json(docs)
    })
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

module.exports = router

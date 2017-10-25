const router = require('express').Router()
const jobs = require('../database/mongoose').jobs
const indeed = require('../data-resources/indeed').custom
const authenticJobs = require('../data-resources/authenticjobs').custom

router.get('/', (req, res) => {
  keywords = ['developer', 'javascript', 'react', 'python', 'django', 'software', 'engineer', 'web', 'startup']
  const criteria = {
    $or: keywords.map(word => ({ title: { $regex: word, $options: 'i' } })).concat(keywords.map(word => ({ description: { $regex: word, $options: 'i' } })))
  }

  jobs.find(criteria, 'title company location datepost URL', { sort: '-datepost' })
    .then(docs => {
      const length = docs.length
      docs = docs.slice(0, 75)
      res.json({ results: docs, length })
    })
    .catch(err => {
      console.log(err)
      res.json({ results: [], length: 0 })
    })
})

router.post('/paginated', (req, res) => {
  const criteria = {
    $or: req.body.keywords.map(word => ({ title: { $regex: word, $options: 'i' } })).concat(req.body.keywords.map(word => ({ description: { $regex: word, $options: 'i' } })))
  }

  const cityRegExp = new RegExp(`${req.body.place.city.replace(' ', '\\s?')}`, 'gi')

  criteria.location = { $regex: cityRegExp }

  const skip = (req.body.page - 1) * 75

  jobs.find(criteria, 'title company location datepost URL', { sort: '-datepost', skip, limit: 75 })
    .then(docs => res.json(docs))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

router.post('/', (req, res) => {
  const criteria = {
    $or: req.body.keywords.map(word => ({ title: { $regex: word, $options: 'i' } })).concat(req.body.keywords.map(word => ({ description: { $regex: word, $options: 'i' } })))
  }

  const cityRegExp = new RegExp(`${req.body.place.city.replace(' ', '\\s?')}`, 'gi')

  criteria.location = { $regex: cityRegExp }

  jobs.find(criteria, 'title company location datepost URL', { sort: '-datepost' })
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

            const length = found_jobs.length
            sliced_jobs = found_jobs.slice(0, 75)
            res.json({ results: sliced_jobs, length })
          })
          .catch(() => {
            const length = docs.length
            res.json({ results: docs, length })
          })

      }

      else {
        const length = docs.length
        docs = docs.slice(0, 75)
        res.json({ results: docs, length })
      }
    })
    .catch(err => {
      console.log(err)
      res.json({ results: [], length: 0 })
    })
})

module.exports = router

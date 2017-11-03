const router = require('express').Router()
const jobs = require('../database/mongoose').jobs
const indeed = require('../data-resources/indeed').custom
const authenticJobs = require('../data-resources/authenticjobs').custom

router.get('/', (req, res) => {
  keywords = ['developer', 'javascript', 'react', 'python', 'django', 'software', 'engineer', 'web', 'startup', 'full-stack', 'front-end']
  const criteria = {
    $or: keywords.map(word => ({ title: { $regex: word, $options: 'i' } })).concat(keywords.map(word => ({ description: { $regex: word, $options: 'i' } })))
  }

  jobs.find(criteria, 'title company location datepost URL', { sort: '-datepost' })
    .then(docs => {
      console.log(docs.length)
      res.json({ jobs: docs.slice(0, 50), pages: Math.ceil(docs.length / 50) })
    })
    .catch(err => {
      console.log(err)
      res.json({ jobs: [], pages: 0 })
    })
})

router.post('/paginated', (req, res) => {
  const keywords = req.body.keywords.map(word => new RegExp(`${word.replace('-', '(-|\\s)?')}`, 'i'))

  const $or = keywords.map($regex => ({ title: { $regex } }))
    .concat(keywords.map($regex => ({ description: { $regex } })))

  const criteria = { $or, location: { $regex: new RegExp(`${req.body.place.city.replace(' ', '\\s?')}`, 'gi') } }

  jobs.find(criteria, 'title company location datepost URL', { sort: '-datepost' })
    .then(docs => {
      const startPoint = Math.floor((req.body.page - 1) * 50)

      res.json({ jobs: docs.slice(startPoint, startPoint + 50), pages: Math.ceil(docs.length / 50) })
    })
    .catch(err => {
      console.log(err)
      res.json({ jobs: [], pages: 0 })
    })
})

router.post('/', (req, res) => {
  const keywords = req.body.keywords.map(word => new RegExp(`${word.replace('-', '(-|\\s)?')}`, 'i'))

  const $or = keywords.map($regex => ({ title: { $regex } }))
    .concat(keywords.map($regex => ({ description: { $regex } })))

  const criteria = { $or, location: { $regex: new RegExp(`${req.body.place.city.replace(' ', '\\s?')}`, 'gi') } }

  jobs.find(criteria, 'title company location datepost URL', { sort: '-datepost' })
    .then(docs => {
      const length = docs.length
      if (length < 25) {

        Promise.all([
          indeed(req.body.keywords, req.body.place),
          authenticJobs(req.body.keywords, req.body.place)
        ])
          .then(newData => {
            const found_jobs = [].concat(...newData)
            found_jobs.sort((a, b) => b.datepost - a.datepost)

            const newLength = found_jobs.length
            const sliced_jobs = found_jobs.slice(0, 50)
            res.json({ jobs: sliced_jobs, pages: Math.ceil(newLength / 50) })
          })
          .catch(() => res.json({ jobs: docs, pages: Math.ceil(length / 50) }))

      }
      else {
        res.json({ jobs: docs.slice(0, 50), pages: Math.ceil(length / 50) })
      }
    })
    .catch(err => {
      console.log(err)
      res.json({ jobs: [], pages: 0 })
    })
})

module.exports = router

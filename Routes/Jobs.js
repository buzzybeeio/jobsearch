const router = require('express').Router()
const jobs = require('../database/mongoose').jobs
const indeed = require('../data-resources/indeed').custom
const authenticJobs = require('../data-resources/authenticjobs').custom

router.get('/', (req, res) => {
  keywords = ['developer', 'javascript', 'react', 'python', 'django', 'software', 'engineer', 'web', 'startup', 'full-stack', 'front-end']
  const criteria = {
    $or: keywords.map(word => ({ title: { $regex: word, $options: 'i' } })).concat(keywords.map(word => ({ description: { $regex: word, $options: 'i' } })))
  }

  jobs.paginate(criteria, { select: 'title company location datepost URL', sort: '-datepost', limit: 75 })
    .then(data => {
      res.json({ jobs: data.docs, length: data.total })
    })
    .catch(err => {
      console.log(err)
      res.json({ jobs: [], length: 0 })
    })
})

router.post('/paginated', (req, res) => {
  const keywords = req.body.keywords.map(word => new RegExp(`${word.replace('-', '(-|\\s)?')}`, 'i'))

  const $or = keywords.map($regex => ({ title: { $regex } }))
    .concat(keywords.map($regex => ({ description: { $regex } })))

  const criteria = { $or, location: { $regex: new RegExp(`${req.body.place.city.replace(' ', '\\s?')}`, 'gi') } }

  const options = {
    select: 'title company location datepost URL',
    sort: '-datepost',
    page: req.body.page,
    limit: 75
  }

  jobs.paginate(criteria, options)
    .then(data => {
      res.json({ jobs: data.docs, length: data.total })
    })
    .catch(err => {
      console.log(err)
      res.json({ jobs: [], length: 0 })
    })
})

router.post('/', (req, res) => {
  const keywords = req.body.keywords.map(word => new RegExp(`${word.replace('-', '(-|\\s)?')}`, 'i'))

  const $or = keywords.map($regex => ({ title: { $regex } }))
    .concat(keywords.map($regex => ({ description: { $regex } })))

  const criteria = { $or, location: { $regex: new RegExp(`${req.body.place.city.replace(' ', '\\s?')}`, 'gi') } }

  const options = {
    select: 'title company location datepost URL',
    sort: '-datepost',
    limit: 75
  }

  jobs.paginate(criteria, options)
    .then(data => {
      if (data.total < 25) {

        Promise.all([
          indeed(req.body.keywords, req.body.place),
          authenticJobs(req.body.keywords, req.body.place)
        ])
          .then(newData => {
            const found_jobs = [].concat(...newData)
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
            const sliced_jobs = found_jobs.slice(0, 75)
            res.json({ jobs: sliced_jobs, length })
          })
          .catch(() => res.json({ jobs: data.docs, length: data.total }))

      }

      else {
        res.json({ jobs: data.docs, length: data.total })
      }
    })
    .catch(err => {
      console.log(err)
      res.json({ jobs: [], length: 0 })
    })
})

module.exports = router

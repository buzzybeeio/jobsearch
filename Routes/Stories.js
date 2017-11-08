const router = require('express').Router()
const stories = require('../database/mongoose').stories

router.get('/stories', (req, res) => {
  stories.find({}, null, { sort: '-date', limit: 8 })
    .then(docs => res.json(docs))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

router.get('/story/:name', (req, res) => {
  stories.findOne({ name: req.params.name }, 'component')
    .then(doc => res.json(doc))
    .catch(err => {
      console.log(err)
      res.json({})
    })
})

router.get('/findStory/:str', (req, res) => {
  const names = req.params.str.split(' ')
  const criteria = {
    $or: names.map(NAME => ({ name: { $regex: NAME, $options: 'i' } }))
  }

  stories.find(criteria, 'name')
    .then(docs => res.json(filtered))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

module.exports = router

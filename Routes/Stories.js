const router = require('express').Router()
const { stories } = require('../database/mongoose')

router.get('/stories', (req, res) => {
  stories.find({}).sort('-date').limit(8).exec()
    .then(docs => res.json(docs))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

router.get('/story/:name', (req, res) => {
  stories.findOne({ name: req.params.name }).select('component').exec()
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

  stories.find(criteria).select('name').exec()
    .then(docs => res.json(docs))
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

module.exports = router

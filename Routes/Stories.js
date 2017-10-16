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

router.get('/story/:storyID', (req, res) => {
  stories.findById(req.params.storyID)
    .then(doc => res.json(doc))
    .catch(err => {
      console.log(err)
      res.json({})
    })
})

router.get('/findStory/:str', (req, res) => {
  const words = req.params.str.split(' ').map(word => word.toLowerCase())

  stories.find({}, 'name')
    .then(docs => {
      // If a word matches, it returns True, then that gets converted to a
      // False, breaking the .every loop and returning a false, which then gets converted to
      // True, and not filtering it, if none of the words match, the .every loop returns a true,
      // and then it gets converted to false, and the doc gets filtered
      const filtered = docs.filter(({ name }) => !words.every(word => !name.includes(word)))
      res.json(filtered)
    })
    .catch(err => {
      console.log(err)
      res.json([])
    })
})

module.exports = router

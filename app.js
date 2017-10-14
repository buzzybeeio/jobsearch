const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const stories = require('./database/mongoose').stories;
const jobs = require('./database/mongoose').jobs;

const jobObject = {}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (request, response) => {
  jobs.find({}, { sort: '-datepost' }, (err, docs) => {
    if (err) response.json([])
    else response.json(docs)
  })
})

app.get('/stories', (request, response) => {
  stories.find({}, null, { sort: '-date', limit: 8 }, (err, docs) => {
    if (err) response.json([])
    else response.json(docs)
  })
})

app.get('/story/:storyID', (request, response) => {
  stories.findById(request.params.storyID, (err, story) => {
    if (err) response.json({})
    else response.json(story)
  })
})

app.get('/findStory/:str', () => {
  const words = req.params.str.split(' ')
  const criteria = {
    $or: words.map(word => ({})),
    limit: 20
  }

  stories.find(criteria, 'name', (err, stories) => {
    if (err) response.json({})
    else response.json(stories)
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
  jobs.remove({}, () => {
    require('./data-resources/authenticjobs')
    require('./data-resources/indeed')
  })
})

const queryCommands = require('./database/database');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const stories = ('./database/mongoose').stories;
const jobs = ('./database/mongoose').jobs;

const jobObject = {}

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (request, response) => {
    queryCommands.getAllJobs()
        .then(results => {
            let count = 1;
            results.forEach(result => {
                jobObject[count] = result
                count++
            })
            response.json(jobObject)
        })
        .catch(console.log)
})

app.get('/stories', (request, response) => {
    stories.find({}, null, { sort: '-date', limit: 8 }, (err, stories) => {
        if (err) response.json([])
        else response.json(stories)
    })
})

app.get('/story/:storyID', (request, response) => {
    stories.findById(req.params.storyID, (err, story) => {
        if (err) response.json({})
        else response.json(story)
    })
})

app.listen(port, function () {
    console.log(`Listening on port ${port}`)
})


const queryCommands = require('./database/database.js');
const express = require('express')
const app = express()
const port = process.env.PORT || 3000 

const jobObject = {}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (request, response) => {
    queryCommands.getAllJobs()
        .then( results => {
            let count = 1; 
            results.forEach(result => {
                jobObject[count] = result
                count ++
            })
            response.json(jobObject)
        })
        .catch(console.log)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})


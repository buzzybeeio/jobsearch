const query_commands = require('./database/database.js');
const express = require('express')
const app = express()
const port = process.env.PORT || 3000 

const jobObject = {}

app.get('/', (request, response) => {
    query_commands.getAllJobs()
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
  console.log('Example app listening on port 3000 or I don\'t know!')
})


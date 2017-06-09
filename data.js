const query_commands = require('./database/database.js');

const jobObject = {}

query_commands.getAllJobs()
    .then( results => {
        console.log(results)
    })
    .catch(console.log)
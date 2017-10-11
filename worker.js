const queryCommands = require('./database/database')
const jobs = require('./database/mongoose').jobs

jobs.remove({}, () => {
    queryCommands.deleteAll().then(
        result => {
            require('./data-resources/authenticjobs')
            require('./data-resources/indeed')
        }
    )
})

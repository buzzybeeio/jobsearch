const queryCommands = require('./database/database')
const jobs = require('./database/mongoose').jobs

process.on('unhandledRejection', (Reason, Promise) => {
    console.log('Reason =>>>>>>', Reason, 'Promise =>>>>>>', Promise)
})

jobs.remove({}, () => {

})


setTimeout(() => {
    queryCommands.deleteAll().then(
        result => {
            require('./data-resources/authenticjobs')
            require('./data-resources/dice')
            require('./data-resources/indeed')
        }
    )
}, 1000)

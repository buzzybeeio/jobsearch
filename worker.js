const queryCommands = require("./database/database.js")

process.on('unhandledRejection', (Reason, Promise) => {
    console.log('Reason =>>>>>>', Reason, 'Promise =>>>>>>', Promise)
})

queryCommands.deleteAll().then(
    result => {
        require('./data-resources/authenticjobs')
        require('./data-resources/dice')
        require('./data-resources/indeed')
    }
)
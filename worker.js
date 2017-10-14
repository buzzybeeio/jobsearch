const jobs = require('./database/mongoose').jobs

jobs.remove({})
  .then(() => {
    require('./data-resources/authenticjobs')
    require('./data-resources/indeed')
  })
  .catch(err => {
    console.log('error removing')
    console.log(err)
  })

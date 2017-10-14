const jobs = require('./database/mongoose').jobs

jobs.remove({}, () => {
  require('./data-resources/authenticjobs')
  require('./data-resources/indeed')
})

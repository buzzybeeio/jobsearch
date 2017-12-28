const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const stories = require('./database/mongoose').stories;
const jobs = require('./database/mongoose').jobs;
const bodyParser = require('body-parser');
const validator = require('express-validator')
const errors = require('./Routes/errors')

app.use(bodyParser.json())
app.use(validator())
app.use((req, res, next) => {
  res.error = function (errCode) {
    res.json([errors[errCode].user])
  }

  res.fnError = function(errCode) {
    return err => {
      console.log(err.message)
      res.error(errCode)
    }
  }

  res.success = function (message) {
    res.json({ success: message })
  }

  next()
})
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(require('./Routes/Jobs'))
app.use(require('./Routes/Stories'))
app.use(require('./Routes/Users'))

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
  jobs.remove({}).exec()
    .then(() => {
      console.log('adding Jobs')
      require('./data-resources/authenticjobs').store()
      require('./data-resources/indeed').store()
    })
    .catch(err => {
      console.log('error removing')
      console.log(err)
    })
})

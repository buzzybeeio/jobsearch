const express = require('express');
const app = express();
const stories = require('./database/mongoose').stories;
const jobs = require('./database/mongoose').jobs;
const errors = require('./Routes/errors');
const enviroment = require('./config/env');

//initializing passport
require('./config/passport')

// Middleware
const { json: JSONparser, urlencoded: URLparser } = require('body-parser')
app.use(URLparser({ extended: false }))
app.use(JSONparser())
app.use(require('express-validator')())
app.use(require('passport').initialize())
app.use((req, res, next) => {
  res.error = function (errCode) {
    res.json([errors[errCode].user])
  }
  res.fnError = function (errCode) {
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
app.use(require('./Routes/Auth'))

app.listen(enviroment.PORT, () => {
  console.log(`Listening on port ${enviroment.PORT}`)
  if (!enviroment.OFFLINE) {
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
  }
})

const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
})

const stories = mongoose.model('stories', Schema({
  name: String,
  component: String,
  date: Number
}))

const jobs = mongoose.model('jobs', Schema({
  title: String,
  company: String,
  location: String,
  datepost: Number,
  URL: String
}))

module.exports = { stories, jobs }
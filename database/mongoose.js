const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
})

const jobsSchema = Schema({
  title: String,
  company: String,
  location: String,
  datepost: Number,
  URL: String,
  description: String
})

jobsSchema.plugin(mongoosePaginate)

const stories = mongoose.model('stories', Schema({
  name: String,
  component: String,
  date: Number
}))

const jobs = mongoose.model('jobs', jobsSchema)

module.exports = { stories, jobs }
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
  URL: String,
  description: String
}))

const ourJobs = mongoose.model('ourjobs', Schema({
  title: String,
  company: String,
  location: String,
  datepost: Number,
  URL: String,
  description: String,
}))

const users = mongoose.model('users', Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  SignupDate: { type: Number, default: Date.now },
  verified: { type: Boolean, default: false },
  verificationDate: { type: Number, default: 0 },
  password: { type: String, required: true },
}))

//collection for password recovery
const prURL = mongoose.model('passwordrecovery', Schema({
  URL: { type: String, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  creatingDate: { type: Number, default: Date.now }
}))

//collection for email verification
const vURL = mongoose.model('verify', Schema({
  URL: { type: String, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'users' }
}))

module.exports = { stories, jobs, ourJobs, users, prURL, vURL }
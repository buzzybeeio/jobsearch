const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

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

const usersSchema = Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  SignupDate: { type: Number, default: Date.now },
  verified: { type: Boolean, default: false },
  verificationDate: { type: Number, default: 0 },
  password: { type: String, required: true },
})

usersSchema.statics.findUserForRegister = function (user) {
  return this.findOne({
    $or: [{ email: user.email }, { username: user.username }]
  }).select('email username')
}

usersSchema.pre('save', function (next) {
  let user = this
  bcrypt.hash(user.password, 15, function (err, hash) {
    if (err) {
      console.log(err.message)
      next(new Error('h'))
    } else {
      user.password = hash
      next()
    }
  })
})

usersSchema.statics.findUnverifiedUser = function (str) {
  return this.findOne({
    verified: false,
    $or: [{ username: str }, { email: str }]
  }).select('password username firstName lastName email')
}

usersSchema.statics.findUser = function (str) {
  return this.findOne({
    verified: true,
    $or: [{ username: str }, { email: str }]
  }).select('password username firstName lastName email')
}

usersSchema.statics.findByIdAndVerify = function (id) {
  return this.findByIdAndUpdate(id, { verified: true, verificationDate: Date.now() })
}

const users = mongoose.model('users', usersSchema)

//collection for email verification
const vURL = mongoose.model('verify', Schema({
  user: { type: Schema.Types.ObjectId, ref: 'users' }
}))

module.exports = { stories, jobs, ourJobs, users, vURL }
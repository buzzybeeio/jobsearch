const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')
const { ExtractJwt: { fromAuthHeaderWithScheme }, Strategy: JWTStrategy } = require('passport-jwt')
const { users } = require('../database/mongoose')
const { compare } = require('../functions')

const Local = new LocalStrategy({ usernameField: 'string' }, (string, password, done) => {
  const catchErr = message => err => done(err, false, message)
  //Finding a verrified user
  users.findUser(string).exec()
    .then(user => {
      if (!user) {
        //If no user found
        done(null, false, ['Wrong email, username or password'])
      } else {
        //comparing hash and password
        compare(password, user.password)
          .then(match => {
            if (match) {
              //If the password matches the hash send the data
              done(null, {
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
              })
            } else {
              //If the password doesn't match the hash
              done(null, false, ['Wrong email, username or password'])
            }
          }).catch(catchErr('L00')) // compare catch
      }
    }).catch(catchErr('L01')) // findUser catch
})
passport.use(Local)

const optionsJWT = { jwtFromRequest: fromAuthHeaderWithScheme('JWT'), secretOrKey: require('./env').secret }
const jwt = new JWTStrategy(optionsJWT, (payload, done) => {
  const { _id: user_id, password } = payload
  const catchErr = message => err => done(null, false, message)
  //Finding a verrified user
  users.findById(user_id).exec()
    .then(user => {
      if (!user) {
        //If no user found
        done(null, false, 'User not found')
      } else {
        //comparing hash and password
        compare(password, user.password)
          .then(match => {
            if (match) {
              //If the password matches the hash send the data
              done(null, {
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
              })
            } else {
              //If the password doesn't match the hash
              done(null, false, 'Wrong password')
            }
          }).catch(catchErr('There was an error try again later!')) // compare catch
      }
    }).catch(catchErr('There was an error try again later!')) // findUser catch
})
passport.use(jwt)
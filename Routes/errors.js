const registerERRORS = {
  R00: 'Error: hashing password',
  R01: 'Error: sending email',
  R02: 'Error: saving the URL',
  R03: 'Error: saving the user',
  R04: 'Error: looking for a user that has taken the email/username'
}

const loginERRORS = {
  L00: 'Error: comparing the password and the hash',
  L01: 'Error: finding a verified user'
}

const verifyERRORS = {
  V00: 'Error: no string / the string wasn\'t alpanumerical',
  V01: 'Error: User verified but URL wasn\'t removed',
  V02: 'Error: User found but not verified',
  V03: 'Error: User not found, and URL wasn\'t removed',
  V04: 'Error: Trying to find user',
  V05: 'Error: Trying to find URL'
}
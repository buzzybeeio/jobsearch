module.exports = {
  R00: { user: 'There was an error, try again later! \n Error: R00', us: 'Error: hashing password' },
  R01: { user: 'There was an error, our email didn\'t arrive, try clicking the "Resend verification email" button! \n Error: R01', us: 'Error: sending email' },
  R02: { user: 'There was an error, Try to contacting us through info@buzzybee.io \n Error: R02', us: ' Error: saving the URL' },
  R03: { user: 'There was an error, try again later! \n Error: R03', us: 'Error: saving the user' },
  R04: { user: 'There was an error, try again later! \n Error: R04', us: 'Error: looking for a user that has taken the email/username' },

  L00: { user: 'There was an error, try again later! \n Error: L00', us: 'Error: comparing the password and the hash' },
  L01: { user: 'There was an error, try again later! \n Error: L01', us: 'Error: finding a verified user' },

  FP00: { user: 'There was an error, try again later! \n Error: FP00', us: 'Error: hashing new password' },
  FP01: { user: 'An error occured while sending the mail, try again later! \n if the error keeps happening contact us through info@buzzybee.io \n Error: FP01', us: 'Error: Sending email' },
  FP02: { user: 'There was an error, try again later! \n Error: FP02', us: 'Error: updating password' },
  FP03: { user: 'There was an error, try again later! \n Error: FP03', us: 'Error: creating password with crypto' },
  FP04: { user: 'There was an error, try again later!, remember you have to verify your account \n Error: FP04', us: 'Error: finding a verified user' },

  RVE00: { user: 'An error occured while sending the mail, try again later! \n if the error keeps happening contact us through info@buzzybee.io \n Error: RVE00', us: 'Error: Sending email' },
  RVE01: { user: 'There was an error, try again later! \n Error: RVE01', us: 'Error: finding vURL' },
  RVE02: { user: 'There was an error, try again later! \n Error: RVE02', us: 'Error: finding user' },

  CP00: { user: 'User not found???!!! \n Error: CP00', us: 'Error: User not found' },
  CP01: { user: 'There was an error, try again later! \n Error: CP01', us: 'Error: comparing the current password and the hash' },
  CP02: { user: 'There was an error, try again later! \n Error: CP02', us: 'Error: creating new hash' },
  CP03: { user: 'There was an error, try again later! \n Error: CP03', us: 'Error: changing password' },

  V00: { user: 'There was an error, try again later! \n Error: V00', us: 'Error: no string' },
  V01: { user: 'There was an error, try again later! \n Error: V01', us: 'Error: User verified but URL wasn\'t removed' },
  V02: { user: 'There was an error, try again later! \n Error: V02', us: 'Error: User found but not verified' },
  V03: { user: 'There was an error, try again later! \n Error: V03', us: 'Error: The URL wasn\'t removed (User not found)' },
  V04: { user: 'There was an error, try again later! \n Error: V00', us: 'Error: Trying to find URL' }
}
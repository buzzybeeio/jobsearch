const { randomBytes } = require('crypto')
module.exports = {
  Mongo_url: process.env.MONGODB_URI || 'mongodb://localhost/buzzybee',
  PORT: process.env.PORT || 4000,
  OFFLINE: process.env.OFFLINE || false,
  secret: (randomBytes(50).toString('base64') || process.env.BACKUPSECRET) || 'rm3n2huyfeuw-+jh+2dfvedsiuvc3213grhry8uweikr3n9++jgr=jrgwcJeeegufodsough48',
  EMAIL: process.env.EMAIL || 'welcome@buzzybee.io',
  PASS: process.env.PASS || 'guest123'
}
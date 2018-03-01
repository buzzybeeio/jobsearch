module.exports = {
  Mongo_url: process.env.MONGODB_URI || 'mongodb://localhost/buzzybee',
  PORT: process.env.PORT || 4000,
  OFFLINE: process.env.OFFLINE || false,
  secret: process.env.SECRET || 'rm3n2huyfeuw-+jh+2dfvedsiuvc3213grhry8uweikr3n9++jgr=jrgwcJeeegufodsough48',
  EMAIL: process.env.EMAIL || 'welcome@buzzybee.io',
  PASS: process.env.PASS || 'guest123'
}
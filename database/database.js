const connectionString = `postgres://${process.env.USER}@localhost:5432/jobdata`
const pgp = require('pg-promise')()
const db = pgp(connectionString)

const insert = (input) => {
    db.oneOrNone("INSERT INTO job(title, company, location, datepost, URL) VALUES ($1, $2, $3, $4, $5)", input)
}

const getAllJobs = () => {
    return db.any("SELECT * FROM job")
}

module.exports = {
    insert,
    getAllJobs 
}
const connectionString = process.env.DATABASE_URL || `postgres://${process.env.USER}@localhost:5432/jobdata`
const pgp = require('pg-promise')()
const db = pgp(connectionString)

const deleteAll = () => {
    return db.oneOrNone("DELETE FROM job")
}

const insert = (input) => {
    db.oneOrNone("INSERT INTO job(title, company, location, datepost, URL) VALUES ($1, $2, $3, $4, $5)", input)
}

const getAllJobs = () => {
    return db.any("SELECT * FROM job ORDER by datepost DESC")
}

module.exports = {
    deleteAll,
    insert,
    getAllJobs
}

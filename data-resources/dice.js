const axios = require('axios');
const queryCommands = require('../database/database.js');
let dateoption = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }; 
process.on('unhandledRejection', (Reason, Promise) => {
    console.log('Reason =>>>>>>', Reason, 'Promise =>>>>>>', Promise)
})

const ROOT_URL = 'http://service.dice.com/api/rest/jobsearch/v1/simple.json?text='; 
const language = 'javascript'
const country = 'US'
const cityState = 'San+Francisco,+CA'
const age = '7'
const page = '1'

const insertjobs = ({data}) =>
    data.resultItemList.forEach(({jobTitle, company, location, date, detailUrl}) => {
        date = new Date(date)
        queryCommands.insert([jobTitle, company, location, date, detailUrl])
    })

axios.get(`${ROOT_URL}${language}&country=${country}&city=${cityState}&age=${age}&page=${page}`)
    .then(insertjobs, console.log)
const axios = require('axios');
const query_commands = require('./database/database.js');

const ROOT_URL = 'http://service.dice.com/api/rest/jobsearch/v1/simple.json?text='; 
const language = 'javascript'
const country = 'US'
const cityState = 'San+Francisco,+CA'
const age = '7'
const page = '1'

const insertjobs = ({data}) =>
    data.resultItemList.forEach(({jobTitle, company, location, date, detailUrl}) => {
        query_commands.insert([jobTitle, company, location, date, detailUrl])
    })

axios.get(`${ROOT_URL}${language}&country=${country}&city=${cityState}&age=${age}&page=${page}`)
    .then(insertjobs, console.log)
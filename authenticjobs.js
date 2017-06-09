const axios = require('axios'); 
const query_commands = require('./database/database.js')

const ROOT_URL = 'https://authenticjobs.com/api/?api_key='; 
const KEY = 'c1f69b196fc568a7850bbb092eef2748'; 
let keywords = 'software,engineer,developer'; 
const location = 'sanfrancisco'
let numberofjobs = '20'

const insertjobs = ({data}) =>
    data.listings.listing.forEach(({title, company, post_date, url}) => {
        query_commands.insert([title, company.name, company.location.city, post_date, url])
    })

axios.get(`${ROOT_URL}${KEY}&method=aj.jobs.search&keywords=${keywords}&perpage=${numberofjobs}&location=${location}&format=json`)
    .then( insertjobs , console.log )
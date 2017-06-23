require('dotenv').config( {path: '../.env'})
const axios = require('axios'); 
const queryCommands = require('../database/database.js'); 
process.on('unhandledRejection', (Reason, Promise) => {
    console.log('Reason =>>>>>>', Reason, 'Promise =>>>>>>', Promise)
})

let dateoption = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }; 

const ROOT_URL = 'https://authenticjobs.com/api/?api_key='; 
const KEY = 'c1f69b196fc568a7850bbb092eef2748'; 
let keywords = 'software,engineer,developer'; 
const location = 'sanfrancisco'
let numberofjobs = '20'

const insertjobs = ({data}) =>
    data.listings.listing.forEach(({title, company, post_date, url}) => {
        queryCommands.insert([title, company.name, company.location.city, post_date, url])
    })

axios.get(`${ROOT_URL}${KEY}&method=aj.jobs.search&keywords=${keywords}&perpage=${numberofjobs}&location=${location}&format=json`)
    .then( insertjobs , console.log )
    .catch(console.log)
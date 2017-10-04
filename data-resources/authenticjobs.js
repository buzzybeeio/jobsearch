const axios = require('axios');
const queryCommands = require('../database/database.js');
const jobs = require('../database/mongoose.js').jobs;
process.on('unhandledRejection', (Reason, Promise) => {
    console.log('Reason =>>>>>>', Reason, 'Promise =>>>>>>', Promise)
})

const dateoption = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};

const ROOT_URL = 'https://authenticjobs.com/api/?api_key=';
const KEY = 'c1f69b196fc568a7850bbb092eef2748';
const keywords = 'software,engineer,developer';
const location = 'sanfrancisco'
const numberofjobs = '30'

const insertjobs = ({ data }) => {
    data.listings.listing.forEach(({ title, company, post_date, url }) => {
        post_date = new Date(post_date)
        queryCommands.insert([title, company.name, company.location.city, post_date, url])

        let job = new jobs({ title, company, location, datepost: post_date, URL: url })
        job.save(err => {
            if (err) {
                console.log(`error saving job ${jobTitle}:${company}, ${err}`)
            }
        });
        
    })
}


axios.get(`${ROOT_URL}${KEY}&method=aj.jobs.search&keywords=${keywords}&perpage=${numberofjobs}&location=${location}&format=json`)
    .then(insertjobs, console.log)
    .catch(console.log)
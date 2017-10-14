const axios = require('axios');
const jobs = require('../database/mongoose.js').jobs;

// keep track of promises
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
    // selecting the specific data that we are getting back
    data.listings.listing.forEach(({ title, company, post_date, url }) => {
        try {
            const datepost = (new Date(post_date)).getTime()
            //inserting the data to mongoDB
            const job = new jobs({ title, company: company.name, location, datepost, URL: url })
            job.save().catch(err => {
                if (err) {
                    console.log(`error saving job "${title}", authentic jobs`)
                }
            });
        }
        catch (e) {
            console.log('Error with authentic jobs')
        }
    })
}

// Making the http request and insterting those jobs into our database.
axios.get(`${ROOT_URL}${KEY}&method=aj.jobs.search&keywords=${keywords}&perpage=${numberofjobs}&location=${location}&format=json`)
    .then(insertjobs)
    .catch(console.log)

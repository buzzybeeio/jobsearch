const axios = require('axios');
const queryCommands = require('../database/database.js');
const jobs = require('../database/mongoose.js').jobs;

const dateoption = {
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
const page = '3'

const insertjobs = ({ data }) => {
    data.resultItemList.forEach(({ jobTitle, company, location, date, detailUrl }) => {
        date = new Date(date)
        if (company !== "CyberCoders") {
            queryCommands.insert([jobTitle, company, location, date, detailUrl])
            let job = new jobs({ title: jobTitle, company, location, date, URL: detailUrl })
            job.save(err => {
                if(err){
                    console.log(`error saving job ${jobTitle}:${company}, ${err}`)
                }
            });
        }
    })
}


axios.get(`${ROOT_URL}${language}&country=${country}&city=${cityState}&age=${age}&page=${page}`)
    .then(insertjobs, console.log)
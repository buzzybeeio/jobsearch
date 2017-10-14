const axios = require('axios');
const jobs = require('../database/mongoose').jobs;

const dateoption = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};

const ROOT_URL = 'http://service.dice.com/api/rest/jobsearch/v1/simple.json?text=';
const language = 'javascript'
const country = 'US'
const cityState = 'San+Francisco,+CA'
const age = '7'
const page = '3'

const insertjobs = ({ data }) => {
    data.resultItemList.forEach(({ jobTitle, company, location, date, detailUrl }) => {
        if (company !== "CyberCoders") {
            try {
                const datepost = (new Date(date)).getTime()
                const job = new jobs({ title: jobTitle, company: company.name, location, datepost, URL: detailUrl })
                job.save().catch(err => {
                    if (err) {
                        console.log(`error saving job "${jobTitle}", dice`)
                    }
                });
            }
            catch (e) {
                console.log('Error with dice')
            }

        }
    })
}

axios.get(`${ROOT_URL}${language}&country=${country}&city=${cityState}&age=${age}&page=${page}`)
    .then(insertjobs)
    .catch(console.log)

const axios = require('axios');
const jobs = require('../database/mongoose').jobs;

const ROOT_URL = 'https://authenticjobs.com/api/?api_key=';
const KEY = 'c1f69b196fc568a7850bbb092eef2748';
const keywords = 'software,engineer,developer';
const location = 'sanfrancisco'
const numberofjobs = '50'

module.exports = {
  custom: function (KEYWORDS, place) {
    KEYWORDS = KEYWORDS.join(',')
    place = place.city.replace('', ' ').toLowerCase()
    return new Promise((resolve, reject) => {
      axios.get(`${ROOT_URL}${KEY}&method=aj.jobs.search&keywords=${KEYWORDS}&perpage=100&location=${place}&format=json`)
        .then(({ data }) => {
          resolve(
            data.listings.listing.map(({ title, company, post_date, url, description }) => {
              const datepost = (new Date(post_date)).getTime()
              const object = { title, company: company.name, location, datepost, URL: url, description }
              object.description = object.description.replace(/<.*?>/g, ' ')

              jobs.findOneAndUpdate({
                title: object.title,
                company: object.company,
                description: object.description
              }, object, { upsert: true }).exec()
                .catch(err => {
                  if (err) {
                    console.log(`error saving job "${title}", authenticjobs`)
                  }
                })

              return object
            })
          )
        })
        .catch(err => {
          console.log(err)
          reject('')
        })
    })
  },
  store: function () {
    const insertjobs = ({ data }) => {
      // selecting the specific data that we are getting back
      data.listings.listing.forEach(({ title, company, post_date, url, description }) => {
        try {
          const datepost = (new Date(post_date)).getTime()
          //inserting the data to mongoDB
          description = description.replace(/<.*?>/g, ' ')
          const job = new jobs({ title, company: company.name, location, datepost, URL: url, description })
          
          job.save().then(() => console.log(`added authenticjobs job "${title}"`)).catch(err => {
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
  }
}
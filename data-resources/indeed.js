const api = require('../indeed-api').getInstance('7256479688442809');
const jobs = require('../database/mongoose').jobs;
const crawlerConstructor = require('crawler');

const crawler = new crawlerConstructor({
  maxConnections: 5
})

module.exports = {
  custom: function (keywords, location) {
    keywords = [keywords.join(' ')]

    return new Promise((resolve, reject) => {
      api.JobSearch()
        .Radius(20)
        .WhereLocation(location)
        .Limit(50)
        .WhereKeywords(keywords)
        .UserIP('1.2.3.4')
        .UserAgent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
        .Search(({ results }) => {
          resolve(
            results.map(({ jobtitle, company, city, date, url }) => {
              const datepost = (new Date(date)).getTime()
              const object = { title: jobtitle, company, location: city, datepost, URL: url }

              crawler.queue({
                uri: url,
                callback: function (err, res, done) {
                  let crawled
                  if (err) {
                    console.log(err)
                    object.description = ''
                    crawled = 'not crawled'
                  }
                  else {
                    const selection = res.$('#job_summary')
                    if (selection.length) {
                      object.description = selection.html()
                      object.description = object.description.replace(/<.*?>/g, ' ')
                      crawled = 'crawled'
                    }
                    else {
                      console.log('#job_summary wasn\'t found')
                      object.description = ''
                      crawled = 'not crawled'
                    }
                  }

                  jobs.findOneAndUpdate({
                    title: object.title,
                    datepost: object.datepost,
                    company: object.company
                  }, object, { upsert: true })
                    .catch(err => {
                      if (err) {
                        console.log(`error saving job "${title}", indeed, ${crawled}`)
                      }
                    })

                  done()
                }
              })

              return object
            })
          )
        }, err => {
          console.log(err)
          reject('')
        })
    })
  },
  store: function () {
    const insertjobs = ({ results }) =>
      results.forEach(({ jobtitle, company, city, date, url }) => {
        try {
          const datepost = (new Date(date)).getTime()
          const object = { title: jobtitle, company, location: city, datepost, URL: url }
          crawler.queue({
            url: url,
            callback: function (err, res, done) {
              let crawled
              if (err) {
                console.log(err)
                object.description = ''
                crawled = 'not crawled'
              }
              else {
                const selection = res.$('#job_summary')
                if (selection.length) {
                  object.description = selection.html()
                  object.description = object.description.replace(/<.*?>/g, ' ')
                  crawled = 'crawled'
                }
                else {
                  console.log('#job_summary wasn\'t found')
                  object.description = ''
                  crawled = 'not crawled'
                }
              }

              const job = new jobs(object)

              job.save().then(() => console.log(`added indeed job "${jobtitle}", ${crawled}`)).catch(err => {
                if (err) {
                  console.log(`error saving job "${jobtitle}", indeed, ${crawled}`)
                }
              })
            }
          })

        }
        catch (e) {
          console.log('Error with indeed')
        }
      })

    api.JobSearch()
      .Radius(20)
      .WhereLocation({
        city: "San Francisco",
        state: "CA"
      })
      .Limit(50)
      .WhereKeywords(["frontend backend full stack engineer developer javascript"])
      .UserIP("1.2.3.4")
      .UserAgent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36")
      .Search(insertjobs, console.log);
  }
}
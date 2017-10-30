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
                  if (err) {
                    console.log(err)
                    object.description = ''

                    jobs.findOneAndUpdate(object, object, { upsert: true })
                      .catch(err => {
                        if (err) {
                          console.log(`error saving job "${title}", indeed, not crawled`)
                        }
                      })

                    done()
                  }
                  else {
                    object.description = res.$('#job_summary').html()
                    const job = new jobs(object)

                    jobs.findOneAndUpdate(object, object, { upsert: true })
                      .catch(err => {
                        if (err) {
                          console.log(`error saving job "${jobtitle}", indeed, crawled`)
                        }
                      })
                    done()
                  }
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
              if (err) {
                console.log(err)
                object.description = ''
                const job = new jobs(object)

                job.save().then(() => console.log(`added indeed job "${jobtitle}", not crawled`)).catch(err => {
                  if (err) {
                    console.log(`error saving job "${jobtitle}", indeed`)
                  }
                })
              }
              else {
                object.description = res.$('#job_summary').html()
                const job = new jobs(object)

                job.save().then(() => console.log(`added indeed job "${jobtitle}", crawled`)).catch(err => {
                  if (err) {
                    console.log(`error saving job "${jobtitle}", indeed`)
                  }
                })
                done()
              }
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
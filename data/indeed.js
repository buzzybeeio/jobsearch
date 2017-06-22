const api = require('indeed-api').getInstance('7256479688442809');
const query_commands = require('./database/database.js');
let dateoption = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }; 

const insertjobs = ({results}) =>
    results.forEach(({jobtitle, company, city, date, url}) => {
        query_commands.insert([jobtitle, company, city, date, url])
    })

api.JobSearch()
    .Radius(20)
    .WhereLocation({
       city : "San Francisco",
        state : "CA"
    })
    .Limit(20)
    .WhereKeywords(["frontend backend full stack engineer developer javascript"])
    .SortBy("date")
    .UserIP("1.2.3.4")
    .UserAgent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36")
    .Search( insertjobs , console.log )
;

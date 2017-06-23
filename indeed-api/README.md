#Node Indeed API
﻿
﻿This is a small library for interacting with the Indeed API via node.js.

﻿As the Indeed API only supports 2 endpoints, there are 2 operations you can perform in the library.

- Job Search
- Get Jobs

###Usage

An instance of the api can be invoked by calling getInstance() and providing it your publisher id.

```js
var api = require('indeed-api').getInstance("YOUR-PUBLISHER-ID-HERE");
```

From there, the JobSearch() and GetJobs() endpoints can be accessed.

Each endpoints query builder is accessed through chainable methods.

####Do a job search
Searches for a jobs based on the defined query.

######Available Methods:
- WhereKeywords(keywords)		-- Sets the keywords to be used in the query
- WhereLocation(location)		-- Sets the location query values for the search query
- SortBy(value)							-- Sets the value to sort by.
- Radius(radius)						-- Sets the distance to include in the search results. Radius is "as the crow flies" from the location.
- WhereSiteType(type)				-- Specifies the site type to use in the search.
- WhereJobType(type)				-- Specifies the job type to use in the search.
- FromResult(position)			-- Sets the maximum number of results retured by the query.
- Limit(limit)							-- Sets the number of days back to search
- Fromage(from)							-- Sets whether or not to highlight the keywords in the results
- Highlight(bool)						-- Sets whether or not to filter duplicate results
- FilterDuplicates(bool)		-- Sets whether or not to include the lat/lng position in the results
- IncludePosition(bool)			-- Sets the country to use in the search.
- WhereCountry(country)			-- Sets the channel to use in the search. Will group the results to the specific channel.
- WhereChannel(channel)			-- Sets the IP number of the end-user who will see the results.
- UserIP(userip)						-- Sets the User-Agent (browser) of the end-user who will see the results.
- UserAgent(userAgent)			-- Sets the User-Agent (browser) of the end-user who will see the results.

```js
// do a job search
api.JobSearch()
	.Radius(20)
	.WhereLocation({
		city : "Stevens Point",
		state : "WI"
	})
	.Limit(2)
	.WhereKeywords(["Information Technology"])
	.SortBy("date")
	.UserIP("1.2.3.4")
	.UserAgent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36")
	.Search(
		function (results) {
		// do something with the success results
		console.log(results);
	},
		function (error) {
		// do something with the error results
		console.log(error);
	})
;
```

####Retrieve jobs
Retrieves specific job results based on their job key. (Available from the search results).

######Available Methods:
- WhereJobKeys(jobkeys)		-- Sets the job keys to use in the retrieval

```js
var jobkeys = ["6a293ed4c08fe90c", "3c609d8c08b9297e", ...];
api.GetJob().WhereJobKeys(jobkeys).Retrieve(
	function (results) {
		// do something with the success results
		console.log(results);
	},
	function (error) {
		// do something with the error results
		console.log(error);
	})
);
```

** The object structure in the results will be the same for both a search and retrieval **

##Contribution

Bug fixes and features are welcomed.

##License

MIT License

Copyright (C) 2012 Veselin Todorov

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



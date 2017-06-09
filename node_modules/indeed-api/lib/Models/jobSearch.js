var rest = require('restler'),
querystring = require('querystring'),
Util = require('../util.js');

var apiEndpoint = '/apisearch';

var JobSearch = module.exports = function (domain, publisherId) {

	var query = {
		// Publisher ID. This is assigned when you register as a publisher.
		publisher : publisherId,
		// API Version. Always will be 2.
		v : 2,
		// Output format of the api. Will always use json
		format : "json",
		// we're not including the callback function in out requrets
		//callback : ""
		// Query
		q : undefined,
		// Location. Use a postal code or a "city, state/province/region" combination.
		l : undefined,
		// Sort by relevance or date. Default is relevance.
		sort : "relevance",
		// Distance from search location ("as the crow flies"). Default is 25.
		radius : 25,
		// Site type. To show only jobs from job boards use 'jobsite'. For jobs from direct employer websites use 'employer'.
		st : "",
		// Job type. Allowed values: "fulltime", "parttime", "contract", "internship", "temporary".
		jt : "",
		// Start results at this result number, beginning with 0. Default is 0.
		start : 0,
		// Maximum number of results returned per query. Default is 10
		limit : 10,
		// Number of days back to search.
		fromage : "",
		// Setting this value to 1 will bold terms in the snippet that are also present in q. Default is 0.
		highlight : 0,
		// Filter duplicate results. 0 turns off duplicate job filtering. Default is 1.
		filter : 1,
		// If latlong=1, returns latitude and longitude information for each job result. Default is 0.
		latlong : 0,
		// Search within country specified. Default is 'us'.
		co : "us",
		// Channel Name: Group API requests to a specific channel
		chnl : "",
		// The IP number of the end-user to whom the job results will be displayed. This field is required.
		userip : undefined,
		// The User-Agent (browser) of the end-user to whom the job results will be displayed. This can be obtained from the "User-Agent" HTTP request header from the end-user. This field is required.
		useragent : undefined
	};

	/**
	 *	Sets the keywords to be used in the query
	 *	@param {Array} keywords     the keywords to be used in the query
	 *
	 *  @return {Object}            Returns the current instance of the JobSearch object
	 */
	this.WhereKeywords = function (keywords) {
		if (keywords instanceof Array) {
			var kwery = "";

			keywords.forEach(function (element, index, array) {
				if (index == array.length - 1)
					kwery = element;
				else
					query = (kwery + element + " AND ");
			});

			query.q = kwery;

		} else
			throw 'keywords must be an array!';

		return this;
	};

	/**
	 *   Sets the location query values for the search query
	 *   @param {Object} location    A location object container either postCode or city & state values
	 *
	 *   @return {Object}            Returns the current instance of the JobSearch object
	 */
	this.WhereLocation = function (location) {
		if (location instanceof Object) {
			if (location.postalCode)
				query.l = location.postalCode;
			else if (location.city && location.state)
				query.l = (location.city + ", " + location.state);
			else
				throw "A location value cannot be determined from the provided object. location must contain postalCode, or city & state";
		} else
			throw "location must be an object containing: latitude & longitude, city & state, city, or state."

			return this;
	};

	/**
	 *   Sets the value to sort by.
	 *   @param {String} value       The value to sort by. Allowed values are "date" & "relevance"
	 *
	 *   @return {Object}            Returns the current instance of the JobSearch object
	 */
	this.SortBy = function (value) {
		var allowedValues = ["date", "relevance"];

		if (allowedValues.indexOf(value) > -1)
			query.sort = value;
		else
			throw (value + ' is not a valid value. Allowed values are [' + allowedValues.toString() + ']');

		return this;
	};

	/**
	 *   Sets the distance to include in the search results. Radius is "as the crow flies" from the location.
	 *   @param {Numeric} radius     The raidus to include in the search
	 *
	 *   @return {Object}            Returns the current instance of the JobSearch object
	 */
	this.Radius = function (radius) {
		if (Util.isNumeric(radius))
			query.radius = radius;
		else
			throw "radius must be a numeric value!";

		return this;
	};

	/**
	 *   Specifies the site type to use in the search.
	 *   @param {String} type       The site type to use. Allowed values are "all", "jobsite", and "employer".
	 *
	 *   @return {Object}            Returns the current instance of the JobSearch object
	 */
	this.WhereSiteType = function (type) {
		var allowedValues = ["all", "jobsite", "employer"];
		if (allowedValues.indexOf(type) > -1) {
			if (type != "all")
				query.st = type;
		} else
			throw(type + ' is not a valid value. Allowed values are [' + allowedValues.toString() + ']');

		return this;
	};

	/**
	 *   Specifies the job type to use in the search.
	 *   @param {String} type       The job type to use. Allowed values are "all", "fulltime", "parttime", "contract", "internship", "temporary".
	 *
	 *   @return {Object}           Returns the current instance of the JobSearch object
	 */
	this.WhereJobType = function (type) {
		var allowedValues = ["all", "fulltime", "parttime", "contract", "internship", "temporary"];
		if (allowedValues.indexOf(type) > -1) {
			if (type != "all")
				query.jt = type;
		} else
			throw(type + ' is not a valid value. Allowed values are [' + allowedValues.toString() + ']');

		return this;
	};

	/**
	 *   Sets the number that the results should be started from.
	 *   @param {Numeric} position   The number to start the results at, beginning with 0.
	 *
	 *   @return {Object}           Returns the current instance of the JobSearch object
	 */
	this.FromResult = function (position) {
		if (Util.isNumeric(position)) {
			if (position >= 0)
				query.start = position;
			else
				throw "position must be >= 0";
		} else
			throw "position must be a numeric value!";

		return this;
	};

	/**
	 *   Sets the maximum number of results retured by the query.
	 *   @param {Numeric} limit      The max number of results to return
	 *
	 *   @return {Object}           Returns the current instance of the JobSearch object
	 */
	this.Limit = function (limit) {
		if (Util.isNumeric(limit))
			query.limit = limit;
		else
			throw "limit must be a numeric value!";

		return this;
	};

	/**
	 *   Sets the number of days back to search
	 *   @param {Numeric} from      The number of past days to include in the search
	 *
	 *   @return {Object}           Returns the current instance of the JobSearch object
	 */
	this.Fromage = function (from) {
		if (Util.isNumeric(from))
			query.fromage = from;
		else
			throw "from must be a numeric value!";

		return this;
	};

	/**
	 *   Sets whether or not to highlight the keywords in the results
	 *   @param {boolean} bool   Keywords should be highlighted
	 *
	 *   @return {Object}       Returns the current instance of the JobSearch object
	 */
	this.Highlight = function (bool) {
		if (typeof bool === "boolean")
			query.highlight = bool ? 1 : 0;
		else
			throw new "bool must be a boolean value!";

		return this;
	};

	/**
	 *   Sets whether or not to filter duplicate results
	 *   @param {boolean} bool   Duplicates should should be highlighted
	 *
	 *   @return {Object}        Returns the current instance of the JobSearch object
	 */
	this.FilterDuplicates = function (bool) {
		if (typeof bool === "boolean")
			query.filter = bool ? 1 : 0;
		else
			throw new "bool must be a boolean value!";

		return this;
	};

	/**
	 *   Sets whether or not to include the lat/lng position in the results
	 *   @param {boolean} bool   Include lat/lng
	 *
	 *   @return {Object}        Returns the current instance of the JobSearch object
	 */
	this.IncludePosition = function (bool) {
		if (typeof bool === "boolean")
			query.latlong = bool ? 1 : 0;
		else
			throw new "bool must be a boolean value!";

		return this;
	};

	/**
	 *   Sets the country to use in the search.
	 *   @param {String} country     The country to use in the search. Must be a valid country code from the Indeed api documentation.
	 *
	 *   @return {Object}        Returns the current instance of the JobSearch object
	 */
	this.WhereCountry = function (country) {
		var countries = {
			us : 'United States',
			ar : 'Argentina',
			au : 'Australia',
			at : 'Austria',
			bh : 'Bahrain',
			be : 'Belgium',
			br : 'Brazil',
			ca : 'Canada',
			cl : 'Chile',
			cn : 'China',
			co : 'Colombia',
			cz : 'Czech Republic',
			dk : 'Denmark',
			fi : 'Finland',
			fr : 'France',
			de : 'Germany',
			gr : 'Greece',
			hk : 'Hong Kong',
			hu : 'Hungary',
			in : 'India',
			id : 'Indonesia',
			ie : 'Ireland',
			il : 'Israel',
			it : 'Italy',
			jp : 'Japan',
			kr : 'Korea',
			kw : 'Kuwait',
			lu : 'Luxembourg',
			my : 'Malaysia',
			mx : 'Mexico',
			nl : 'Netherlands',
			nz : 'New Zealand',
			no : 'Norway',
			om : 'Oman',
			pk : 'Pakistan',
			pe : 'Peru',
			ph : 'Philippines',
			pl : 'Poland',
			pt : 'Portugal',
			qa : 'Qatar',
			ro : 'Romania',
			ru : 'Russia',
			sa : 'Saudi Arabia',
			sg : 'Singapore',
			za : 'South Africa',
			es : 'Spain',
			se : 'Sweden',
			ch : 'Switzerland',
			tw : 'Taiwan',
			tr : 'Turkey',
			ae : 'United Arab Emirates',
			gb : 'United Kingdom',
			ve : 'Venezuela'
		};

		if (countries[country])
			query.co = country;
		else
			throw new (country + ' is not a value country code. Reference indeed api documentation for allowed values.');

		return this;
	};

	/**
	 *   Sets the channel to use in the search. Will group the results to the specific channel.
	 *   For more information on channels, see the indeed api documentation.
	 *
	 *   @param {String} channel     The channel name to group api results under.
	 *
	 *   @return {Object}        Returns the current instance of the JobSearch object
	 */
	this.WhereChannel = function (channel) {
		query.chnl = channel;

		return this;
	};

	/**
	 *   Sets the IP number of the end-user who will see the results.
	 *
	 *   @param {String} userip     The IP number of the end user.
	 *
	 *   @return {Object}        Returns the current instance of the JobSearch object
	 */
	this.UserIP = function (userip) {
		query.userip = userip;
		return this;
	};

	/**
	 *   Sets the User-Agent (browser) of the end-user who will see the results.
	 *
	 *   @param {String} userAgent     The User-Agent (browser) of the end user.
	 *
	 *   @return {Object}        Returns the current instance of the JobSearch object
	 */
	this.UserAgent = function (userAgent) {
		query.useragent = userAgent;
		return this;
	};


	/**
	 *   Executes the search.
	 *
	 *   @param {function} callback         The function to invoke on a success result. Accepts parameter of a single json object (the result).
     *   @param {function} errorCallback    The function to invoke on a failed result. Accepts parameter of a single json object (the error result).
	 */
    this.Search = function(callback, errorCallback)
    {
        // validate the fields, will throw an exception if invalid
        if(validateRequiredFields())
        {
            var qs = querystring.stringify(query);
            var url = ("http://" + domain + apiEndpoint + "?" + qs);

            rest.get(url).on('complete', function(result)
            {
                var jsonResult=result;
                if(result instanceof Error)
                {
                    if(errorCallback) errorCallback(jsonResult);
                }
                else 
                {
                    if(callback) callback(jsonResult);
                }
            });
        }
    };

    /**
    *   Validates the required fields in the query object.
    *   Throws an error message if a required field is not declared.
    *
    *   @return true if all required fields are specified.
    */
    var validateRequiredFields = function()
    {
        if(!query.userip)
            throw "user ip is required.";

        if(!query.useragent)
            throw "User-Agent is required.";

        return true;
    };
};





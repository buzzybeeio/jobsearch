var rest = require('restler'),
querystring = require('querystring'),
Util = require('../util.js');

var apiEndpoint = '/apigetjobs';

var GetJobs = module.exports = function(domain, publisherId)
{
    var query = {
        // Publisher ID. This is assigned when you register as a publisher.
		publisher : publisherId,
		// API Version. Always will be 2.
		v : 2,
		// Output format of the api. Will always use json
		format : "json",
        // Job keys. A comma separated list of job keys specifying the jobs to look up. This parameter is required.
        jobkeys : undefined
    };

    /**
    *   Sets the job keys that should be retrieved
    *
    *   @param {Array}  jobkeys     An array of jobkeys that should be retrieved
    */
    this.WhereJobKeys = function(jobkeys)
    {
        if (jobkeys instanceof Array) {
            query.jobkeys = jobkeys;
        } 
        else
		    throw 'jobkeys must be an array!';

		return this;
    };

    /**
	 *   Executes the retrieval of the job results
	 *
	 *   @param {function} callback         The function to invoke on a success result. Accepts parameter of a single json object (the result).
     *   @param {function} errorCallback    The function to invoke on a failed result. Accepts parameter of a single json object (the error result).
	 */
    this.Retrieve = function(callback, errorCallback)
    {
        // validate the fields, will throw an exception if invalid
        if(validateRequiredFields())
        {
            var qs = querystring.stringify(query);
            var url = ("http://" + domain + apiEndpoint + "?" + qs);

            rest.get(url).on('complete', function(result)
            {
                var jsonResult=JSON.parse(result);
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
    *   Validates the required fields in the query object
    *   Throws an error message if a required field is not declared.
    *
    *   @return true if all required fields are specified.
    */
    var validateRequiredFields = function()
    {
        if(!query.jobkeys)
            throw "jobkeys must be defined!";

        return true;
    };
};
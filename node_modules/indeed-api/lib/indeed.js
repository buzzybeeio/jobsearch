var jobSearch   = require('./Models/jobSearch.js'),
    getJobs     = require('./Models/getJobs.js');

var missingPublisherIdError = "A publisher id is required!";

var domain = "api.indeed.com/ads";

var Indeed = module.exports = function (publisherId) {
	if (!publisherId)
		throw missingPublisherIdError;

	this.JobSearch = function () {
		return new jobSearch(domain, publisherId);
	};

	this.GetJob = function () {
        return new getJobs(domain, publisherId);
    };
};

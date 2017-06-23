var IndeedApi = require('./lib/indeed.js');

var Api = function()
{
    this.getInstance = function(developerKey)
    {
        return new IndeedApi(developerKey);
    };
};

module.exports = new Api();
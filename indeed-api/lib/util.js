var Util = function()
{
    this.isNumeric = function(value)
    {
        return !isNaN(parseFloat(value)) && isFinite(value);
    };
};

module.exports = new Util();
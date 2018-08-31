const mongoose = require('mongoose');

mongoose.connect('mongodb://user:password@url:port/bd');
mongoose.Promise = global.Promise;

module.exports = mongoose;

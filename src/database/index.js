const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/simbora');
mongoose.Promise = global.Promise;

module.exports = mongoose;

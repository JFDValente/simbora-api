const mongoose = require('mongoose');

mongoose.connect('mongodb://JFDValente:Abrir123@ds121301.mlab.com:21301/simbora');
mongoose.Promise = global.Promise;

module.exports = mongoose;

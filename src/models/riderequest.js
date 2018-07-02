const mongoose = require('../database');

const RiderequestSchema = new mongoose.Schema({
  idUser:{
    type: String,
  },
  idDriver:{
    type: String,
  },
  Origin:{
    type: String,
  },
  Destiny:{
    type: String,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  }
});

const Riderequest = mongoose.model('Riderequest', RiderequestSchema);

module.exports = Riderequest;

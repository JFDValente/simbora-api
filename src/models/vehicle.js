const mongoose = require('../database');
const bcrypt = require('bcryptjs');

const VehicleSchema = new mongoose.Schema({
  cnh:{
    type: String,
    required: true,
  },
  plate:{
    type: String,
    required: true,
  },
  model:{
    type: String,
    required: true,
  },
  color:{
    type: String,
    required: true,
  },
  emailUser:{
    type: String,
    required: true,
  }
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;

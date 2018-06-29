const mongoose = require('../database');

const LatLngSchema = new mongoose.Schema({
  latitude:{
    type: Number,
  },
  longitude:{
    type: Number,
  }
});

const PolylineRouteSchema = new mongoose.Schema({
  polyline:{
    type: [LatLngSchema],
    required: true,
  },
  idUser:{
    type: String,
    required: true,
  },
  actived:{
    type: Boolean,
    required: true,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model('polylineroute', PolylineRouteSchema);

module.exports = User;

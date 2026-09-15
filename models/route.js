const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  routeNumber: {
    type: String,
    required: true,
    unique: true
  },
  startPoint: {
    type: String,
    required: true
  },
  endPoint: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Route", routeSchema);
const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  stopCode: {
    type: String,
    required: true,
    unique: true
  },
  routes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route"
  }],
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Stop", stopSchema);
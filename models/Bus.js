const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    default: null
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive"
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);
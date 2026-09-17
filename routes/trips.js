const express = require("express");
const Trip = require("../models/Trip");
const Bus = require("../models/Bus");
const { auth, driverOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/start", auth, driverOnly, async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    const bus = await Bus.findById(busId).populate("route");

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found"
      });
    }

    if (!bus.driver || bus.driver.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "This bus is not assigned to you"
      });
    }

    if (!bus.route) {
      return res.status(400).json({
        message: "Bus has no route"
      });
    }

    const existingTrip = await Trip.findOne({
      bus: busId,
      status: "ongoing"
    });

    if (existingTrip) {
      return res.status(400).json({
        message: "Trip already running"
      });
    }

    const trip = await Trip.create({
      bus: busId,
      driver: req.user.userId,
      route: bus.route._id,
      startTime: new Date(),
      startLocation: {
        latitude,
        longitude
      },
      status: "ongoing"
    });

    bus.status = "active";
    await bus.save();

    res.status(201).json({
      message: "Trip started",
      trip
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.post("/end/:tripId", auth, driverOnly, async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.body;

    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    if (trip.driver.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You cannot end this trip"
      });
    }

    if (trip.status === "completed") {
      return res.status(400).json({
        message: "Trip already completed"
      });
    }

    trip.endTime = new Date();
    trip.endLocation = {
      latitude,
      longitude
    };
    trip.distance = distance || 0;
    trip.status = "completed";

    await trip.save();

    const bus = await Bus.findById(trip.bus);

    if (bus) {
      bus.status = "inactive";
      await bus.save();
    }

    res.json({
      message: "Trip completed",
      trip
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get("/my-trips", auth, driverOnly, async (req, res) => {
  try {
    const trips = await Trip.find({
      driver: req.user.userId
    })
      .populate("bus", "busNumber")
      .populate("route", "name routeNumber startPoint endPoint")
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("bus", "busNumber")
      .populate("driver", "name email")
      .populate("route", "name routeNumber startPoint endPoint")
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;
const express = require("express");
const Bus = require("../models/Bus");
const { getIO } = require("../socket");
const { auth, adminOnly, driverOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/driver/:driverId", auth, driverOnly, async (req, res) => {
  try {
    if (req.user.userId !== req.params.driverId) {
      return res.status(403).json({
        message: "You can only access your own driver data"
      });
    }

    const buses = await Bus.find({
      driver: req.params.driverId
    })
      .populate("route")
      .populate("driver", "name email");

    res.json(buses);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate("driver", "name email")
      .populate(
        "route",
        "name routeNumber startPoint endPoint"
      );

    res.json(buses);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate("driver", "name email")
      .populate(
        "route",
        "name routeNumber startPoint endPoint"
      );

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found"
      });
    }

    res.json(bus);
  } catch (err) {
    console.log("Bus details error:", err.message);

    res.status(500).json({
      message: err.message
    });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const { busNumber, driver, route, status } = req.body;

    if (!busNumber) {
      return res.status(400).json({
        message: "Bus number is required"
      });
    }

    if (driver) {
      const existingBus = await Bus.findOne({
        driver
      });

      if (existingBus) {
        return res.status(400).json({
          message: "This driver is already assigned to a bus"
        });
      }
    }

    const bus = await Bus.create({
      busNumber,
      driver: driver || null,
      route: route || null,
      status: status || "inactive"
    });

    res.status(201).json(bus);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { driver, route } = req.body;

    if (driver) {
      const existingBus = await Bus.findOne({
        driver,
        _id: { $ne: req.params.id }
      });

      if (existingBus) {
        return res.status(400).json({
          message: "This driver is already assigned to another bus"
        });
      }
    }

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        driver: driver || null,
        route: route || null
      },
      {
        new: true
      }
    )
      .populate("driver", "name email")
      .populate(
        "route",
        "name routeNumber startPoint endPoint"
      );

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found"
      });
    }

    res.json(bus);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.post("/:id/location", auth, driverOnly, async (req, res) => {
  try {
    console.log("GPS request received:", req.body);

    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required"
      });
    }

    const bus = await Bus.findOne({
      _id: req.params.id,
      driver: req.user.userId
    });

    if (!bus) {
      return res.status(403).json({
        message: "You can only update your assigned bus"
      });
    }

    bus.latitude = latitude;
    bus.longitude = longitude;
    bus.status = "active";

    await bus.save();

    const io = getIO();

    console.log(
      "Location event sent:",
      bus._id,
      bus.latitude,
      bus.longitude
    );

    io.emit("busLocationUpdate", {
      busId: bus._id,
      latitude: bus.latitude,
      longitude: bus.longitude
    });

    res.json({
      message: "Location updated successfully",
      bus
    });
  } catch (err) {
    console.log("GPS error:", err.message);

    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;
const express = require("express");
const Stop = require("../models/Stop");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const stop = await Stop.create(req.body);
    res.status(201).json(stop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const stops = await Stop.find().populate("routes", "name routeNumber");
    res.json(stops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id).populate(
      "routes",
      "name routeNumber"
    );

    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    res.json(stop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
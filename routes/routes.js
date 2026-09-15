const express = require("express");
const Route = require("../models/Route");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
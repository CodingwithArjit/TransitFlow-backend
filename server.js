const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const busRoutes = require("./routes/buses");
const routeRoutes = require("./routes/routes");
const stopRoutes = require("./routes/stops");
const { setIO } = require("./socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
setIO(io);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/stops", stopRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "TransitFlow Backend is running"
  });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinBus", (busId) => {
    socket.join(busId);
    console.log("Joined bus:", busId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed");
    console.log(err.message);
  });
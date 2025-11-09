
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Use Node's native HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend's origin in production
    methods: ["GET", "POST"]
  }
});

// Serve static files (optional)
app.use(express.static("public"));

// Basic route
app.get("/", (req, res) => {
  res.send("Socket.IO server is running!");
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for messages from the client
  socket.on("message", (data) => {
    console.log(`Message from ${socket.id}: ${data}`);
    // Broadcast to all clients
    io.emit("message", `${socket.id}: ${data}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT =  3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
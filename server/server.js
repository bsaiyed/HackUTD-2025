
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


// Allow express to parse JSON bodies
app.use(express.json());



app.post("/api/token", async (req, res) => {
  
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });


// Serve static files (optional)
app.use(express.static("public"));

// Basic route
app.get("/", (req, res) => {
  res.send("Socket.IO server is running0!!");
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
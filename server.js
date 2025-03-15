const express = require("express");
const cors = require("cors");
const app = express();

// Configure CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Your existing middleware
app.use(express.json());

// Your routes
// ...

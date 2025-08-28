const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");

// Load env (optional in prod platforms)
dotenv.config();

const app = express();

// Basic CORS (tighten in prod to your Vercel domain)
app.use(cors({ origin: "*"}));
// Health route (useful for uptime/health checks)
app.get("/", (_req, res) => res.status(200).send("OK"));

const server = http.createServer(app);

// Socket.IO
const socketUtils = require("./utils/socketUtils");
const io = socketUtils.sio(server);
socketUtils.connection(io);

// Optional: expose io on req if you’ll broadcast from HTTP routes later
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Start
const port = process.env.PORT || 9013;
server.listen(port, () => {
  console.log(`Backend listening on port ${port} and  (${process.env.NODE_ENV || "dev"})`);
});

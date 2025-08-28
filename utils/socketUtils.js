const socketIO = require("socket.io");

// --- Random data generator (your original logic, slightly hardened) ---
function makeID(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function makeLocation() {
  // Near Amman; jitter within ~0.1 deg
  return [
    35.93131881204147 + (Math.random() * 2 - 1) / 10,
    31.94878648036645 + (Math.random() * 2 - 1) / 10
  ];
}

function generateData() {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          serial: makeID(10),
          registration: "SD-" + makeID(2),
          Name: "Dji Mavic",
          altitude: Math.floor(Math.random() * 100),
          pilot: "Bashar Telfah",
          organization: "Sager Drone",
          // yaw in degrees (120..139) — tweak as needed
          yaw: 120 + Math.floor(Math.random() * 20)
        },
        geometry: {
          type: "Point",
          coordinates: makeLocation()
        }
      }
    ]
  };
}

// --- Socket.IO bootstrap ---
exports.sio = (server) => {
  return socketIO(server, {
    // Let Socket.IO negotiate websocket first, fallback to polling
    transports: ["websocket", "polling"],
    path: "/socket.io",
    cors: {
      origin: "*"
      // In prod, prefer: origin: ["https://your-frontend.vercel.app"]
    }
  });
};

exports.connection = (io) => {
  io.on("connection", (socket) => {
    console.log(`-> Client ${socket.id} connected`);

    // Emit once per second; clean up on disconnect to avoid leaks
    const timer = setInterval(() => {
      socket.emit("message", generateData());
    }, 1000);

    socket.on("disconnect", () => {
      clearInterval(timer);
      console.log(`-> Client ${socket.id} disconnected`);
    });
  });
};

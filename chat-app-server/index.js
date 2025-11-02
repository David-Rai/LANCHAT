const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const uploadDir = path.join(__dirname, "uploads");

//Middlewares
app.use(cors());
app.use('/uploads',express.static(uploadDir))

//Storage for the multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

//Upload instance
const upload = multer({ storage });

//Multer single file upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded!" });
  }

  io.emit('new-file-upload')

  res.json({
    message: "✅ File uploaded successfully!",
    fileName: req.file.filename,
    fileType: req.file.mimetype,
    fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
    filePath: `/uploads/${req.file.filename}`,
  });
});

//Sending all the files from /uploads
app.get("/files", (req, res) => {

  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read folder" });

  // Return full URLs to the client
  const fileUrls = files.map((file) => ({
    name: file,
    url: `/uploads/${file}`,
  }));

  res.json(fileUrls);
  });
});

//web sockets Handling
const roomName = "chat-room";
io.on("connection", (client) => {
  console.log("new client", client.id);

  //Getting the name and joining the room
  client.on("name", async (name) => {
    client.username = name;
    client.join(roomName);
    client.to(roomName).emit("join-message", name);
  });

  //Getting the message form client along with the username
  client.on("send-message", async ({ message, name }) => {
    console.log(`New messagge from ${name} that is ${message}`);
    io.to(roomName).emit("message", {
      message: message,
      sender_id: client.id,
      sender_name: name,
    });
  });

  //sending the message on disconnect
  client.on("disconnect", async () => {
    // const deletedUser=await userModel.findOneAndDelete({user_id:client.id})
    io.to(roomName).emit("leave-message", client.username);
  });
});

//Routes for routing
app.get("/", (req, res) => {
  res.send("home page ho hai");
});

//Listening on port 1111
const port = process.env.PORT || 1111;
server.listen(port, () => console.log("server is live"));

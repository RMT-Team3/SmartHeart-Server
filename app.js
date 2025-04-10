<<<<<<< HEAD
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
=======
require("dotenv").config();
const { User } = require("./models");

>>>>>>> feat/socket-server
const cors = require("cors");
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const UserControllers = require("./controllers/userController");
const Controller = require("./controllers/controller");
const authentication = require("./middlewares/authentication");
const app = express();
const PORT = process.env.PORT || 3000;

const { createServer } = require("http");
const { Server } = require("socket.io");
const { verify } = require("./helpers/jwt");
const { Message } = require("./models");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
  cors: "*",
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/register", UserControllers.register);
app.post("/login", UserControllers.login);

app.use(authentication);

app.get("/profile", UserControllers.getUserProfile);
app.put("/update", Controller.addPersonalityAndInterest);

app.post("/rooms", Controller.createRoom);
app.get("/rooms/:id", Controller.getRoomById);

app.get("/match", Controller.getMatchingPartner);
app.use(errorHandler);
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const broadcastOnlineUsers = async (io) => {
  const sockets = await io.fetchSockets();

  const onlineUsers = [];

  for (const socket of sockets) {
    const { token } = socket.handshake.auth;
    socket.userId = token ? verify(token).id : null;
    // console.log(socket.id, socket.userId);
    onlineUsers.push({ userId: socket.userId, id: socket.id });
  }

  io.emit("onlineUsers", onlineUsers);
};

io.on("connection", (socket) => {
  // ...
  // console.log(socket.handshake.auth);
  socket.emit("connected", socket.id);

  broadcastOnlineUsers(io);

  socket.on("chat message", (msg) => {
    console.log("Message received:", msg);
    // Broadcast the message to all connected clients

    io.emit("chat message", msg);
  });

  socket.on("joinRoom", async (roomId) => {
    console.log("User joined room:", roomId);
    socket.join(roomId);

    // Ambil semua pesan dalam room
    const messages = await Message.findAll({
      where: { roomId },
      include: [{ model: User, attributes: ["name"] }],
    });

    // Kirim semua pesan ke klien yang baru bergabung
    socket.emit("previousMessages", messages);
  });
  socket.on("foundMatch", async (msg) => {
    console.log("foundMatch:", msg);
    const { userId, matchId } = msg;

    // Emit event ke kedua user
    io.emit(`foundMatch:${matchId}`, msg);
  });
  //capture new chat
  socket.on("newChat", async (msg) => {
    console.log("New chat:", msg);

    try {
      // Simpan pesan ke database
      const user = await User.findByPk(socket.userId);
      const newMessage = await Message.create({
        roomId: msg.roomId,
        senderId: socket.userId,
        content: msg.content,
      });

      console.log("New message saved to database:", newMessage);

      io.to(msg.roomId).emit("newChat", { ...newMessage.toJSON(), User: user });
    } catch (err) {
      console.error("Error saving chat to database:", err);
    }
  });

  socket.on("disconnect", () => {
    broadcastOnlineUsers(io);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port:${PORT}`);
});

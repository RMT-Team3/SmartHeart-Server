require("dotenv").config();

const cors = require("cors");
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const UserControllers = require("./controllers/userController");
const Controller = require("./controllers/controller");
const authentication = require("./middlewares/authentication");
const app = express();
const port = 3000;

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
  cors: "*"
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

io.on("connection", (socket) => {
  // ...
  console.log(socket.id, "connected");
  socket.emit("connected", socket.id);
});

httpServer.listen(port, () => {
  console.log(`Server listening on port:${port}`);
});

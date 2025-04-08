require("dotenv").config();

const cors = require("cors");
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const UserControllers = require("./controllers/userController");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/register", UserControllers.register);
app.post("/login", UserControllers.login);

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

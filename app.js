require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello world");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

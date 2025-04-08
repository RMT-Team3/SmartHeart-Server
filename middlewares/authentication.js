const { verify } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, res, next) {
  try {
    const bearerToken = req.headers.authorization;
    // console.log(bearerToken)
    if (!bearerToken) {
      throw { name: "Unauthorized", message: "Invalid Token" };
    }

    const accesToken = bearerToken.split(" ")[1];
    const data = verify(accesToken);
    // console.log(data)

    const user = await User.findByPk(data.id);
    if (!user) {
      throw { name: "Unauthorized", message: "Invalid Token" };
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authentication;

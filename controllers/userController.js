const { decode } = require("../helpers/bcrypt");
const { sign } = require("../helpers/jwt");
const { User } = require("../models");

class UserControllers {
  static async register(req, res, next) {
    try {
      const { name, email, password, gender, imageUrl } = req.body;

      const newUser = await User.create({
        name,
        email,
        password: password,
        gender,
        imageUrl,
      });
      console.log(newUser.id, "<<<<<<<<");

      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      const isValidPassword = decode(password, user.password);
      if (!isValidPassword) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }
      const access_token = sign({ id: user.id });
      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }

  static async getUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ["password", "email", "createdAt", "updatedAt", "status"],
        },
      });
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
  static async getUserById(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await User.findByPk(userId, {
        attributes: ["imageUrl", "name"],
      });
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserControllers;

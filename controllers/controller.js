const { User } = require("../models");

class Controller {
  static async addPersonalityAndInterest(req, res, next) {
    try {
      const userId = req.user.id;
      let { interests, personalities } = req.body;

      if (typeof interests === "string") {
        // Split the string by commas and trim whitespace
        interests = interests.split(",").map((interest) => interest.trim());
      } else if (!Array.isArray(interests)) {
        interests = []; // Default to an empty array if invalid
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      // Update interests and personalities
      user.interests = [...user.interests, ...(interests || [])];
      user.personalities = personalities || user.personalities;

      await user.save();

      res.status(200).json({
        message: "User updated successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          interests: user.interests,
          personalities: user.personalities,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = Controller;

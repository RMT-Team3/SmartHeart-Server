const { Op } = require("sequelize");
const { User, Room } = require("../models");
const { GoogleGenAI } = require("@google/genai");

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
          personalities: user.personalities
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createRoom(req, res, next) {
    try {
      // Dummy logic generate 2 users
      const users = await User.findAll({ limit: 2 });
      if (users.length < 2) {
        throw {
          name: "NotFound",
          message: "Not enough users to create a room"
        };
      }

      const user1 = users[0];
      const user2 = users[1];

      // Check apakah roomnya sudah ada
      const existingRoom = await Room.findOne({
        where: {
          user1Id: user1.id,
          user2Id: user2.id
        }
      });

      if (existingRoom) {
        throw { name: "BadRequest", message: "Room already exists" };
      }

      // Create a new room
      const newRoom = await Room.create({
        user1Id: user1.id,
        user2Id: user2.id
      });

      res.status(201).json({
        message: "Room created successfully",
        room: {
          id: newRoom.id,
          user1: {
            id: user1.id,
            name: user1.name
          },
          user2: {
            id: user2.id,
            name: user2.name
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // Get matching partner from Google GenAI based on interests and personalities
  static async getMatchingPartner(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);

      // Sementara pake ini kalo mau ganti match
      const { lastMatch } = req.query;
      const excludedId = lastMatch ? [lastMatch, userId] : [userId];

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      const { interests, personalities } = user;
      console.log(interests, personalities);

      const fetchUsersInterests = await User.findAll({
        attributes: ["id", "name", "interests", "personalities"],
        where: {
          id: {
            [Op.notIn]: excludedId
          }
        }
      });

      // console.log(JSON.stringify(fetchUsersInterests, null, 2));

      const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
          Find me one person from this data: 
          ${JSON.stringify(fetchUsersInterests, null, 2)} 
          that best matches me in romace according to my interests: ${interests} and personalities: ${personalities}. Then output the result in JSON format with the following attributes: id, name, interests, personalities of the matching person.

          Lastly, add a "message" key to the JSON object with the value of a single sentence describing the match between me and the person in romance.

          Only output the JSON object, nothing else.
          `
      });
      const matchingPartner = JSON.parse(
        response.text.replace("```json", "").replace("```", "")
      );
      console.log(matchingPartner);

      res.status(200).json(matchingPartner);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = Controller;

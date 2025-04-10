const { Op } = require("sequelize");
const { User, Room } = require("../models");
const { GoogleGenAI } = require("@google/genai");

class Controller {
  static async addPersonalityAndInterest(req, res, next) {
    try {
      const userId = req.user.id;
      let { interests, personalities, gender, imageUrl } = req.body;
      console.log(interests, personalities, gender, imageUrl);

      if (typeof interests === "string") {
        // Split the string by commas and trim whitespace
        try {
          interests = JSON.parse(interests);
        } catch (error) {
          interests = interests.split(",").map((interest) => interest.trim());
        }
      } else if (!Array.isArray(interests)) {
        interests = []; // Default to an empty array if invalid
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      // Update interests and personalities
      // user.interests = [...user.interests, ...(interests || [])];
      // user.personalities = personalities || user.personalities;

      // await user.save();

      // Diganti untuk update full, bukan add existing
      await user.update({
        interests,
        personalities,
        gender,
        imageUrl,
      });

      res.status(200).json({
        message: "User updated successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          interests: user.interests,
          personalities: user.personalities,
          gender: user.gender,
          imageUrl: user.imageUrl,
        },
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
      // console.log(interests, personalities);

      const fetchUsersInterests = await User.findAll({
        attributes: [
          "id",
          "name",
          "interests",
          "personalities",
          "gender",
          "imageUrl",
          "foundMatch",
        ],
        where: {
          id: {
            [Op.notIn]: excludedId,
          },
        },
      });

      // console.log(JSON.stringify(fetchUsersInterests, null, 2));

      const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
          Find me one person from this data: 
          ${JSON.stringify(fetchUsersInterests, null, 2)}  
          with attribute: foundMatch == false, that best matches me in romance according to my interests: ${interests} and personalities: ${personalities}. Then output the result in JSON format with all attributes of the matching person.

          Lastly, add a "message" key to the JSON object with the value of a single sentence describing the match between me and the person in romance.

          Only output the JSON object, nothing else.
          `,
      });
      const matchingPartner = JSON.parse(
        response.text.replace("```json", "").replace("```", "")
      );
      // console.log(matchingPartner);

      // Update kedua user foundMatch ke true
      await User.update(
        { foundMatch: true },
        { where: { id: matchingPartner.id } }
      );
      await user.update({ foundMatch: true });

      //   res.status(200).json(matchingPartner);
      if (res) {
        return res.status(200).json(matchingPartner);
      }
      return matchingPartner;
    } catch (err) {
      next(err);
    }
  }

  static async createRoom(req, res, next) {
    try {
      const userId = req.user.id;

      // Cari user berdasarkan ID
      const user = await User.findByPk(userId);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      // Panggil getMatchingPartner untuk mendapatkan pasangan yang cocok
      const matchingPartner = await Controller.getMatchingPartner(
        req,
        null,
        next
      );

      if (!matchingPartner || !matchingPartner.id) {
        throw { name: "NotFound", message: "No matching partner found" };
      }

      // Periksa apakah room sudah ada
      const existingRoom = await Room.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: matchingPartner.id },
            { user1Id: matchingPartner.id, user2Id: userId },
          ],
        },
      });

      if (existingRoom) {
        return res.status(201).json({
          room: {
            id: existingRoom.id,
            user1: {
              id: user.id,
              name: user.name,
            },
            user2: {
              id: matchingPartner.id,
              name: matchingPartner.name,
            },
            matchMessage: matchingPartner.message,
          },
        });
      }

      // Buat room baru
      const newRoom = await Room.create({
        user1Id: userId,
        user2Id: matchingPartner.id,
      });

      res.status(201).json({
        message: "Room created successfully",
        room: {
          id: newRoom.id,
          user1: {
            id: user.id,
            name: user.name,
          },
          user2: {
            id: matchingPartner.id,
            name: matchingPartner.name,
          },
          matchMessage: matchingPartner.message, // Tambahkan pesan kecocokan
        },
      });
    } catch (err) {
      next(err);
    }
  }
  static async getRoomById(req, res, next) {
    try {
      const { id } = req.params;
      const room = await Room.findByPk(id, {
        include: [
          { model: User, as: "User1", attributes: ["id", "name", "imageUrl"] },
          { model: User, as: "User2", attributes: ["id", "name", "imageUrl"] },
        ],
      });

      if (!room) {
        throw { name: "NotFound", message: "Room not found" };
      }

      res.status(200).json({
        message: "Room retrieved successfully",
        room: {
          id: room.id,
          user1: room.User1,
          user2: room.User2,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = Controller;

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.belongsTo(models.User, {
        foreignKey: "user1Id",
        as: "User1",
      });
      Room.belongsTo(models.User, {
        foreignKey: "user2Id",
        as: "User2",
      });
      Room.hasMany(models.Message, { foreignKey: "roomId" });
    }
  }
  Room.init(
    {
      user1Id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user2Id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Room",
    }
  );
  return Room;
};

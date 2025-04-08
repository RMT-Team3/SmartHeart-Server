"use strict";
const { Model } = require("sequelize");
const { encode } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Message, {
        foreignKey: "senderId",
      });
      User.hasOne(models.Room, {
        foreignKey: "user1Id",
        as: "MatchedRoomAsUser1",
      });

      User.hasOne(models.Room, {
        foreignKey: "user2Id",
        as: "MatchedRoomAsUser2",
      });
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
          notNull: {
            msg: "Name is required",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Email is required",
          },
          notNull: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Must be a valid email address",
          },
        },
        unique: {
          message: "Email is already taken",
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required",
          },
          notNull: {
            msg: "Password is required",
          },
        },
      },
      interests: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      personalities: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        defaultValue: "online",
      },
      foundMatch: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: (user) => {
          if (user.password) {
            user.password = encode(user.password);
          }
        },
        beforeUpdate: (user) => {
          if (user.changed("password")) {
            user.password = hashPassword(user.password);
          }
        },
      },
    }
  );
  return User;
};

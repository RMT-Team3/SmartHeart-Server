"use strict";

const { encode } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      {
        name: "John Doe",
        email: "john@mail.com",
        password: encode("12345"),
        interests: JSON.stringify(["hiking", "photography", "cooking"]),
        personalities: "Introverted and thoughtful",
        gender: "male",
        foundMatch: false,
        imageUrl:
          "https://skiblue.co.uk/wp-content/uploads/2015/06/dummy-profile.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Jane Doe",
        email: "jane@mail.com",
        password: encode("12345"),
        interests: JSON.stringify(["reading", "traveling", "yoga"]),
        personalities: "Extroverted and adventurous",
        gender: "female",
        foundMatch: false,
        imageUrl:
          "https://cpdi-pakistan.org/wp-content/uploads/2020/08/dummy-profile-pic-female-300n300.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Jordan Lee",
        email: "jordan@mail.com",
        password: encode("12345"),
        interests: JSON.stringify(["gaming", "music", "technology"]),
        personalities: "Introverted and analytical",
        gender: "female",
        foundMatch: false,
        imageUrl:
          "https://cpdi-pakistan.org/wp-content/uploads/2020/08/dummy-profile-pic-female-300n300.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};

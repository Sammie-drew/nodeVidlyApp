const express = require("express");
const genres = require("../routes/genres");
const customers = require("../routes/customers");
const movies = require("../routes/movies");
const rentals = require("../routes/rentals");
const register = require("../routes/register");
const login = require("../routes/login");
const error = require("../middleware/error");
const returns = require("../routes/returns");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/register", register);
  app.use("/api/login", login);
  app.use("/api/returns", returns);

  app.use(error);
};

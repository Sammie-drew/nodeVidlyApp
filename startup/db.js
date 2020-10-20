const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");
module.exports = function (params) {
  const db = config.get("db");
  mongoose
    .connect(config.get("db"), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => winston.info(`Connected to ${db}...`));
};

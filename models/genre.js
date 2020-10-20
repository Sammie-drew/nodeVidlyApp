const mongoose = require("mongoose");
const Joi = require("joi");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Genre = new mongoose.model("Genre", genreSchema);

const validationSchema = (genre) => {
  const schema = {
    name: Joi.string().min(5).max(20).required(),
  };

  return Joi.validate(genre, schema);
};

exports.Genre = Genre;
exports.genreSchema = genreSchema;
exports.validationSchema = validationSchema;

const bcrypt = require("bcrypt");
const Joi = require("joi");
const _ = require("lodash");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

const logInValidator = (user) => {
  const schema = {
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(user, schema);
};

router.post("/", async (req, res) => {
  const { error } = logInValidator(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).send("Invalid email and password");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email and password");

    const token = user.generateAuthToken();

    res.send({ jwtToken: token });
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = router;

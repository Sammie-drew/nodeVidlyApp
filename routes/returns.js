const Joi = require("joi");
const express = require("express");
const auth = require("../middleware/auth");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const validate = require("../middleware/validate");
const router = express.Router();

const validationSchema = (req) => {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  };

  return Joi.validate(req, schema);
};

router.post("/", [auth, validate(validationSchema)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send("Rental not found.");

  if (rental.dateReturned) return res.status(400).send("Return already init");

  rental.return();
  await rental.save();

  await rental.save();

  await Movie.update(
    {
      _id: rental.movie._id,
    },
    {
      $inc: {
        numInStock: 1,
      },
    }
  );
  return res.send(rental);
});

module.exports = router;

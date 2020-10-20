const Fawn = require("fawn");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const { Rental, rentalValidator } = require("../models/rental");
const { Customer } = require("../models/customer");
const express = require("express");
const { Movie } = require("../models/movie");
const router = express.Router();

Fawn.init(mongoose);

router.get("/", async (req, res) => {
  try {
    const rentals = await Rental.find().sort("-dateOut");
    res.send(rentals);
  } catch (error) {}
});

router.post("/", auth, async (req, res) => {
  const { error } = rentalValidator(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid Customer.");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid Movie.");

    if (movie.numInStock === 0)
      return res.status(400).send("Movie not in Stock.");

    let rental = new Rental({
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
      movie: {
        _id: movie.id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
    });

    try {
      new Fawn.Task()
        .save("rentals", rental)
        .update(
          "movies",
          { _id: movie._id },
          {
            $inc: { numInStock: -1 },
          }
        )
        .run();

      res.send(rental);
    } catch (error) {
      res.status(500).send("Something went wrong");
    }
  } catch (error) {
    console.log("error", error);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental)
      return res.status(404).send("Rentals with the given Id not found ");

    res.send(rental);
  } catch (error) {
    console.log("error", error);
  }
});

router.put("/:id", auth, async (req, res) => {
  const { error } = rentalValidator(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid Customer.");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid Movie.");

    if (movie.numInStock === 0)
      return res.status(400).send("Movie not in Stock.");

    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      {
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie: {
          _id: movie.id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
        },
      },
      { new: true }
    );

    if (!rental)
      return res.status(404).send("Rental with the given Id was not found");

    rental.save();
    res.status(200).send(rental);
  } catch (error) {
    console.log("error :>> ", error);
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndRemove(req.params.id);

    if (!rental)
      return res.status(404).send("Rental with the given Id was not found");

    res.send(rental);
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = router;

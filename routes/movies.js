const { Movie, movieValidator } = require("../models/movie");
const { Genre } = require("../models/genre");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("name");
  res.send(movies);
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie)
      return res.status(404).send("Movie with the given ID was not found");

    res.send(movie);
  } catch (error) {
    console.log("error", error.message);
  }
});

router.post("/", async (req, res) => {
  const { error } = movieValidator(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("Invalid Genre.");

    const movie = new Movie({
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      numInStock: req.body.numInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    });

    await movie.save();

    res.send(movie);
  } catch (error) {
    console.log("error", error);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = movieValidator(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("Invalid Genre.");

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numInStock: req.body.numInStock,
        dailyRentalRate: req.body.dailyRentalRate,
      },
      { new: true }
    );

    if (!movie)
      return res.status(404).send("Movie with the given ID was not found");

    res.send(movie);
  } catch (error) {
    console.log("error :>> ", error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndRemove(req.params.id);

    if (!movie)
      return res.status(404).send("Movie with the given ID was not found");

    res.send(movie);
  } catch (error) {
    console.log("error :>> ", error.message);
  }
});

module.exports = router;

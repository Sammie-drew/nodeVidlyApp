const moment = require("moment");
const request = require("supertest");
const mongoose = require("mongoose");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { Movie } = require("../../models/movie");

describe("/api/returns", () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  const execute = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../index");

    customerId = mongoose.Types.ObjectId().toHexString();
    movieId = mongoose.Types.ObjectId().toHexString();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
      genre: {
        name: "12345",
      },
      numInStock: 10,
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "Movie Tities",
        dailyRentalRate: 2,
      },
    });
    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.remove({});
    await Movie.remove({});
  });

  it("Should return 401 if client is not logged in", async () => {
    token = "";

    const res = await execute();

    expect(res.status).toBe(401);
  });

  it("Should return 400 if customer id  is not provided", async () => {
    customerId = "";
    const res = await execute();

    expect(res.status).toBe(400);
  });

  it("Should return 400 if movieId id  is not provided", async () => {
    movieId = "";

    const res = await execute();

    expect(res.status).toBe(400);
  });

  it("Should return 404 if no rental found for the customer/movie", async () => {
    await Rental.remove({});

    const res = await execute();

    expect(res.status).toBe(404);
  });

  it("Should return 200 if no rental found for the customer/movie", async () => {
    await Rental.remove({});

    const res = await execute();

    expect(res.status).toBe(404);
  });

  it("Should return 400 if return is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await execute();

    expect(res.status).toBe(400);
  });

  it("Should return 200 if request is valid", async () => {
    const res = await execute();

    expect(res.status).toBe(200);
  });

  it("Should  set return date if input is valid", async () => {
    await execute();

    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it("Should  set rental fee if input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();
    await execute();

    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("Should increase the movie stock if input is valid", async () => {
    await execute();

    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numInStock).toBe(movie.numInStock + 1);
  });

  it("Should return rental in the body of the response if input is valid", async () => {
    const res = await execute();

    await Rental.findById(rental._id);

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie",
      ])
    );
  });
});

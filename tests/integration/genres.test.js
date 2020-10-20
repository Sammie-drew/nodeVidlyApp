const request = require("supertest");
const mongoose = require("mongoose");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    await Genre.remove({});
    await server.close();
  });

  describe("GET /", () => {
    it("Should return all the genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const response = await request(server).get("/api/genres");
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(response.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("Should return a genre when a valid id is passed", async () => {
      const genre = await new Genre({ name: "Genre1" });
      await genre.save();

      const response = await request(server).get(`/api/genres/${genre._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name", genre.name);
    });

    it("Should return 404 if invalid Id is passed", async () => {
      const response = await request(server).get(`/api/genres/1`);

      expect(response.status).toBe(404);
    });
    it("Should return 404 if no genre with the given Id exists", async () => {
      const id = mongoose.Types.ObjectId().toHexString();
      const response = await request(server).get(`/api/genres/${id}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const execute = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("Should return 401 if client is not logged in", async () => {
      token = "";

      const response = await execute();

      expect(response.status).toBe(401);
    });

    it("Should return 400 if genre is less than five", async () => {
      name = "1234";
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it("Should return 400 if genre is more than 50", async () => {
      name = new Array(52).join("a");
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it("Should save genre if genre is Valid", async () => {
      await execute();

      const genre = await Genre.find({ name: "genre1" });

      expect(genre).not.toBeNull();
    });

    it("Should return  genre if genre is Valid", async () => {
      const response = await execute();

      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("name", "genre1");
    });
  });

  describe("Put /:id", () => {
    let token;
    let name;
    let id;
    const getCred = async () => {
      const genre = await new Genre({ name: "Genre1" });
      const res = await genre.save();
      return res._id;
    };

    const execute = async () => {
      return await request(server)
        .put(`/api/genres/${id}`)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = "GenreUpdate";
      id = await getCred();
    });

    it("Should return 401 if not logged in", async () => {
      token = "";

      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("Should return 400 if genre is not valid", async () => {
      name = "1234";
      const res = await execute();
      expect(res.status).toBe(400);
    });

    it("Should return 404 if genre with the given id not found", async () => {
      id = "oiddiadad";
      const res = await execute();

      expect(res.status).toBe(404);
    });

    // it("Should return if ")

    it("Should return 200 if the genre was updated", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "GenreUpdate");
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let id;
    const getCred = async () => {
      const genre = await new Genre({ name: "Genre1" });
      const res = await genre.save();
      return res._id;
    };

    const execute = async () => {
      return await request(server)
        .delete(`/api/genres/${id}`)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      id = await getCred();
    });

    it("Should return 401 if not logged in", async () => {
      token = "";

      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("Should return 404 if genre with the given id not found", async () => {
      id = "oiddiadad";
      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("Should return 200 if the genre was deleted", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
    });
  });
});

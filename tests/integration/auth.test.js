const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

let server;

describe("Auth middleware", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  let token;
  const execute = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });
  it("Should return 401 if no token is provided", async () => {
    token = "";
    const res = await execute();
    expect(res.status).toBe(401);
  });

  it("Should return 400 if  token is inValid", async () => {
    token = "a";
    const res = await execute();
    expect(res.status).toBe(400);
  });

  it("Should return 200 if  token is valid", async () => {
    const res = await execute();
    expect(res.status).toBe(200);
  });
});

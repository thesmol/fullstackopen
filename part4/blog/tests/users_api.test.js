const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const helper = require("./test_helper");
const User = require("../models/user");

const api = supertest(app);

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  describe("viewing user", () => {
    test("succeeds with a valid user id", async () => {
      const users = await helper.usersInDb();
      const userToView = users[0];

      const result = await api
        .get(`/api/users/${userToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(result.body, userToView);
    });

    test("fails with code 400 if id is invalid", async () => {
      const invalidId = "123";
      await api.get(`/api/users/${invalidId}`).expect(400);
    });

    test("fails with code 404 if user not found", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/users/${validNonexistingId}`).expect(404);
    });
  });

  describe("creation of a new user", () => {
    test("succeeds with a fresh username", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "mluukkai",
        name: "Matti Luukkainen",
        password: "salainen",
      };

      await api
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

      const usernames = usersAtEnd.map((u) => u.username);
      assert(usernames.includes(newUser.username));
    });

    test("fails with proper statuscode and message if username already taken", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "root",
        name: "Superuser",
        password: "salainen",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert(result.body.error.includes("expected `username` to be unique"));

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("fails with invalid data", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: "1",
        name: "Superuser",
        password: "2",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();

      assert(
        result.body.error.includes(
          "Username must contains at least 3 characters",
        ),
      );
      assert(
        result.body.error.includes(
          "Password must contains at least 3 characters",
        ),
      );

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("fails with missing required data", async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        name: "Superuser",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert(result.body.error.includes("Username is required"));
      assert(result.body.error.includes("Password is required"));

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });
  });

  describe("deletion of a user", () => {});

  describe("updating of a user", () => {});
});

after(async () => {
  await mongoose.connection.close();
});

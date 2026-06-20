const { test, after, describe, beforeEach } = require("node:test");
const assert = require("node:assert");

const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const helper = require("./test_helper");
const User = require("../models/user");

const api = supertest(app);

describe("when there is initially some users saved", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const users = await Promise.all(
      helper.initialUsers.map(async (user) => {
        const passwordHash = await bcrypt.hash(user.password, 10);
        return new User({
          username: user.username,
          name: user.name,
          passwordHash,
        });
      }),
    );
    await User.insertMany(users);
  });

  test("login succeeds with correct credentials", async () => {
    const user = helper.initialUsers[0];
    const response = await api
      .post("/api/login")
      .send({ username: user.username, password: user.password })
      .expect(200);

    assert.ok(response.body.token);
  });

  test("login fails with 401 and proper error message for incorrect credentials", async () => {
    const user = helper.initialUsers[0];
    const response = await api
      .post("/api/login")
      .send({ username: user.username, password: "wrongpassword" })
      .expect(401);

    assert.strictEqual(response.body.error, "invalid username or password");
    assert.ok(!response.body.token);
  });
});

after(async () => {
  await mongoose.connection.close();
});

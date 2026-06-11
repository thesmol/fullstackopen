const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const helper = require("./test_helper");
const User = require("../models/user");
const Blog = require("../models/blog");

const api = supertest(app);

describe("when there is initially two users in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});

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
    const savedUsers = await User.insertMany(users);

    const mappedBlogs = helper.initialBlogs.map((blog, index) => ({
      ...blog,
      user: index % 2 === 0 ? savedUsers[0].id : savedUsers[1].id,
    }));

    const savedBlogs = await Blog.insertMany(mappedBlogs);

    await Promise.all(
      savedBlogs.map((blog) =>
        User.findByIdAndUpdate(blog.user, { $push: { blogs: blog._id } }),
      ),
    );
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

    test("users have blogs", async () => {
      const users = await helper.usersInDb();
      const userToView = users[0];

      const result = await api
        .get(`/api/users/${userToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(result.body.blogs, userToView.blogs);
      assert(userToView.blogs.length > 0);
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
      const takenName = usersAtStart[0].username;

      const newUser = {
        username: takenName,
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

  describe("deletion of a user", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const usersAtStart = await helper.usersInDb();
      const userToDelete = usersAtStart[0];

      await api.delete(`/api/users/${userToDelete.id}`).expect(204);

      const usersAtEnd = await helper.usersInDb();

      const ids = usersAtEnd.map((n) => n.id);
      assert(!ids.includes(userToDelete.id));

      assert.strictEqual(usersAtEnd.length, usersAtStart.length - 1);
    });

    test("succeeds with status code 204 if user does not exist", async () => {
      const usersAtStart = await helper.usersInDb();
      const nonExistingId = await helper.nonExistingId();

      await api.delete(`/api/users/${nonExistingId}`).expect(204);

      const usersAtEnd = await helper.usersInDb();

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("failed with status code 400 if id is invalid", async () => {
      const invalidId = "123";
      await api.get(`/api/users/${invalidId}`).expect(400);
    });
  });

  describe("updating of a user", () => {
    test("succeeds with valid data", async () => {
      const usersAtStart = await helper.usersInDb();
      const userToUpdate = usersAtStart[0];

      const newData = {
        id: userToUpdate.id,
        name: "eee",
        username: "React patterns 123123",
        password: "Michael Chan",
      };

      await api.put(`/api/users/${userToUpdate.id}`).send(newData).expect(200);

      const usersAtEnd = await helper.usersInDb();
      const updatedUser = usersAtEnd.find((b) => b.id === userToUpdate.id);

      assert.strictEqual(updatedUser.username, newData.username);
      assert.strictEqual(updatedUser.name, newData.name);
      assert(await bcrypt.compare(newData.password, updatedUser.passwordHash));
    });

    test("fails with status code 400 if new username is already taken", async () => {
      const usersAtStart = await helper.usersInDb();
      const userToUpdate = usersAtStart[0];
      const takenUsername = usersAtStart[1].username;

      const newData = {
        id: userToUpdate.id,
        username: takenUsername,
      };

      const result = await api
        .put(`/api/users/${userToUpdate.id}`)
        .send(newData)
        .expect(400);

      console.log(result.body.error);

      assert(result.body.error.includes("expected `username` to be unique"));

      const usersAtEnd = await helper.usersInDb();
      const updatedUser = usersAtEnd.find((b) => b.id === userToUpdate.id);

      assert.strictEqual(updatedUser.username, userToUpdate.username);
    });

    test("fails with status code 400 if invalid user input", async () => {
      const usersAtStart = await helper.usersInDb();
      const userToUpdate = usersAtStart[0];

      const newData = {
        id: userToUpdate.id,
        username: "1",
        password: "1",
      };

      const result = await api
        .put(`/api/users/${userToUpdate.id}`)
        .send(newData)
        .expect(400);

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

      const usersAtEnd = await helper.usersInDb();
      const updatedUser = usersAtEnd.find((b) => b.id === userToUpdate.id);

      assert.deepStrictEqual(updatedUser, userToUpdate);
    });

    test("fails with status code 404 if blog does not exist", async () => {
      const notExistingId = await helper.nonExistingId();

      const newData = {
        id: notExistingId,
        username: "React patterns 123123",
        password: "Michael Chan",
      };
      await api.put(`/api/users/${notExistingId}`).send(newData).expect(404);
    });

    test("fails with statuscode 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";
      await api.get(`/api/users/${invalidId}`).expect(400);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});

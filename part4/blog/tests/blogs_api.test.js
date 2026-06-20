const { test, after, describe, beforeEach } = require("node:test");
const assert = require("node:assert");

const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");

const api = supertest(app);

describe("when there is initially some blogs saved, all created by 1st user, 2 users total", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
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
    const savedUsers = await User.insertMany(users);

    const blogsWithUser = helper.initialBlogs.map((b) => ({
      ...b,
      user: savedUsers[0]._id,
    }));

    await Blog.insertMany(blogsWithUser);
  });

  describe("general checks", () => {
    test("the unique identifier property of the blog posts is named id and not _id", async () => {
      const response = await api.get("/api/blogs");

      assert(response.body.every((b) => "id" in b && !("_id" in b)));
    });

    test("blogs are returned as json", async () => {
      await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all blogs are returned", async () => {
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.body.length, helper.initialBlogs.length);
    });

    test("a specific blog is within the returned blogs", async () => {
      const response = await api.get("/api/blogs");

      const contents = response.body.map((e) => e.id);
      assert(contents.includes(helper.initialBlogs[0]._id));
    });
  });

  describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(resultBlog.body, blogToView);
    });

    test("fails with statuscode 404 if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });

    test("fails with statuscode 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";
      const response = await api.get(`/api/blogs/${invalidId}`).expect(400);
      assert.strictEqual(response.body.error, "malformatted id");
    });
  });

  describe("addition of a new blog", () => {
    test("succeeds with valid data", async () => {
      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        likes: 0,
      };

      const allUsers = await helper.usersInDb();
      const firstUser = allUsers[0];
      const firstUserCredentials = helper.initialUsers.find(
        (u) => u.username === firstUser.username,
      );
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: firstUserCredentials.username,
          password: firstUserCredentials.password,
        })
        .expect(200);

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      const addedBlog = blogsAtEnd.find((b) => b.title === newBlog.title);

      const addedData = {
        title: addedBlog.title,
        author: addedBlog.author,
        url: addedBlog.url,
        likes: addedBlog.likes,
      };

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
      assert.strictEqual(firstUser.id, addedBlog.user.id);
      assert.deepStrictEqual(newBlog, addedData);
    });

    test("fails with status code 400 if no title or url", async () => {
      const newBlogNoTitle = {
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        likes: 0,
      };

      const newBlogNoUrl = {
        author: "Watashi",
        title: "I cant remember anything",
        likes: 0,
      };

      const allUsers = await helper.usersInDb();
      const firstUser = allUsers[0];
      const firstUserCredentials = helper.initialUsers.find(
        (u) => u.username === firstUser.username,
      );
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: firstUserCredentials.username,
          password: firstUserCredentials.password,
        })
        .expect(200);

      await api
        .post("/api/blogs")
        .send(newBlogNoTitle)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(400);
      await api
        .post("/api/blogs")
        .send(newBlogNoUrl)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("succeeds with valid data but missing likes property", async () => {
      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
      };

      const allUsers = await helper.usersInDb();
      const firstUser = allUsers[0];
      const firstUserCredentials = helper.initialUsers.find(
        (u) => u.username === firstUser.username,
      );
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: firstUserCredentials.username,
          password: firstUserCredentials.password,
        })
        .expect(200);

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      const addedBlog = blogsAtEnd.find((b) => b.title === newBlog.title);

      const addedData = {
        title: addedBlog.title,
        author: addedBlog.author,
        url: addedBlog.url,
        likes: addedBlog.likes,
      };

      newBlog.likes = 0;

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
      assert.strictEqual(firstUser.id, addedBlog.user.id);
      assert.deepStrictEqual(newBlog, addedData);
    });

    test("added block visible for user", async () => {
      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        likes: 0,
      };

      const allUsers = await helper.usersInDb();
      const firstUser = allUsers[0];
      const firstUserCredentials = helper.initialUsers.find(
        (u) => u.username === firstUser.username,
      );
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: firstUserCredentials.username,
          password: firstUserCredentials.password,
        })
        .expect(200);

      const { body: savedBlog } = await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const endUsers = await helper.usersInDb();
      const updatedUser = endUsers.find((user) => user.id === firstUser.id);

      assert(updatedUser.blogs.some((b) => b.id === savedBlog.id));
    });

    test("failed with status 401 and proper message if token is invalid", async () => {
      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        likes: 0,
      };

      const response = await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", "Bearer 123")
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
      assert.strictEqual(response.body.error, "token invalid");
    });

    test("failed with status 401 and proper message if no token", async () => {
      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        likes: 0,
      };

      const response = await api.post("/api/blogs").send(newBlog).expect(401);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
      assert.strictEqual(response.body.error, "unauthorized");
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      const allUsers = await helper.usersInDb();
      const blogUser = allUsers.find((u) => u.id === blogToDelete.user.id);
      const userCredentials = helper.initialUsers.find(
        (u) => u.username === blogUser.username,
      );
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: userCredentials.username,
          password: userCredentials.password,
        })
        .expect(200);

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      const ids = blogsAtEnd.map((n) => n.id);
      assert(!ids.includes(blogToDelete.id));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });

    test("succeeds with status code 204 if blog does not exist", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const nonExistingId = await helper.nonExistingId();

      const userCredentials = helper.initialUsers[0];
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: userCredentials.username,
          password: userCredentials.password,
        })
        .expect(200);

      await api
        .delete(`/api/blogs/${nonExistingId}`)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length);
    });

    test("failed with status code 400 if id is invalid", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const invalidId = "123";
      const response = await api.get(`/api/blogs/${invalidId}`).expect(400);
      assert.strictEqual(response.body.error, "malformatted id");

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length);
    });

    test("failed with status 401 and proper message if token is invalid", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      const response = await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", "Bearer 123")
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(response.body.error, "token invalid");
      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length);
    });

    test("failed with status 401 and proper message if no token", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const response = await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(response.body.error, "unauthorized");
      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length);
    });

    test("failed with status 401 and proper message if token from another user", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      const allUsers = await helper.usersInDb();
      const blogWrongUser = allUsers.find((u) => u.id !== blogToDelete.user.id);
      const userCredentials = helper.initialUsers.find(
        (u) => u.username === blogWrongUser.username,
      );
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: userCredentials.username,
          password: userCredentials.password,
        })
        .expect(200);

      const response = await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .expect(403);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(response.body.error, "forbidden");
      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length);
    });
  });

  describe("updating of a blog", () => {
    test("succeeds with valid data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const newData = {
        id: blogToUpdate.id,
        title: "React patterns 123123",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 10,
      };

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(newData).expect(200);

      const blogsAtEnd = await helper.blogsInDb();
      const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);
      const updatedBlogData = {
        id: updatedBlog.id,
        title: updatedBlog.title,
        author: updatedBlog.author,
        url: updatedBlog.url,
        likes: updatedBlog.likes,
      };

      assert.deepStrictEqual(updatedBlogData, newData);
    });

    test("ignores author and url updates, only applies title and likes", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const newData = {
        id: blogToUpdate.id,
        title: "React patterns new suffix",
        author: "Michael Chan new suffix",
        url: "https://reactpatterns.com/new suffix",
        likes: 99,
      };

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(newData).expect(200);

      const blogsAtEnd = await helper.blogsInDb();
      const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);

      assert.strictEqual(updatedBlog.title, newData.title);
      assert.strictEqual(updatedBlog.likes, newData.likes);

      assert.strictEqual(updatedBlog.author, blogToUpdate.author);
      assert.strictEqual(updatedBlog.url, blogToUpdate.url);
    });

    test("fails with status code 400 if invalid user input", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const newData = {
        title: "1",
        url: "https://reactpatterns.  11   com/",
        likes: -100,
      };

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(newData).expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);

      assert.deepStrictEqual(updatedBlog, blogToUpdate);
    });

    test("fails with status code 404 if blog does not exist", async () => {
      const notExistingId = await helper.nonExistingId();

      const newData = {
        id: notExistingId,
        title: "React patterns 123123",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 10,
      };

      await api.put(`/api/blogs/${notExistingId}`).send(newData).expect(404);
    });

    test("fails with statuscode 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      const response = await api.put(`/api/blogs/${invalidId}`).expect(400);
      assert.strictEqual(response.body.error, "malformatted id");
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});

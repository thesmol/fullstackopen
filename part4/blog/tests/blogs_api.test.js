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

describe("when there is initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});

    await Blog.insertMany(helper.initialBlogs);

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({ username: "root", passwordHash });
    await user.save();
  });

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
      await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
  });

  describe("addition of a new blog", () => {
    test("succeeds with valid data", async () => {
      const allUsers = await helper.usersInDb();

      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        likes: 0,
        userId: allUsers[0].id,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const addedBlog = blogsAtEnd.find((b) => b.title === newBlog.title);
      const addedData = {
        title: addedBlog.title,
        author: addedBlog.author,
        url: addedBlog.url,
        likes: addedBlog.likes,
        userId: addedBlog.user.id,
      };

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

      await api.post("/api/blogs").send(newBlogNoTitle).expect(400);
      await api.post("/api/blogs").send(newBlogNoUrl).expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("succeeds with valid data but missing likes property", async () => {
      const allUsers = await helper.usersInDb();

      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        userId: allUsers[0].id,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const addedBlog = blogsAtEnd.find((b) => b.title === newBlog.title);

      const addedData = {
        title: addedBlog.title,
        author: addedBlog.author,
        url: addedBlog.url,
        likes: addedBlog.likes,
        userId: addedBlog.user.id,
      };

      newBlog.likes = 0;

      assert.deepStrictEqual(newBlog, addedData);
    });

    test("added block visible for user", async () => {
      const startUsers = await helper.usersInDb();

      const blogUser = startUsers[0];

      const newBlog = {
        title: "I cant remember anything",
        author: "Watashi",
        url: "https://superblogs.eu/cant-remember-anything",
        likes: 0,
        userId: blogUser.id,
      };

      const { body: savedBlog } = await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const endUsers = await helper.usersInDb();
      const updatedUser = endUsers.find((user) => user.id === blogUser.id);

      assert(updatedUser.blogs.some((b) => b.id === savedBlog.id));
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      const ids = blogsAtEnd.map((n) => n.id);
      assert(!ids.includes(blogToDelete.id));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });

    test("succeeds with status code 204 if blog does not exist", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const nonExistingId = await helper.nonExistingId();

      await api.delete(`/api/blogs/${nonExistingId}`).expect(204);

      assert.strictEqual(blogsAtStart.length, helper.initialBlogs.length);
    });

    test("failed with status code 400 if id is invalid", async () => {
      const invalidId = "123";
      await api.get(`/api/blogs/${invalidId}`).expect(400);
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

      assert.deepStrictEqual(updatedBlog, newData);
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
      await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});

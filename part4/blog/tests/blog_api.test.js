const { test, after, describe, beforeEach } = require("node:test");
const assert = require("node:assert");

const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe("blogs api", () => {
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

  test("the unique identifier property of the blog posts is named id and not _id", async () => {
    const response = await api.get("/api/blogs");

    assert(response.body.every((b) => "id" in b && !("_id" in b)));
  });

  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "I cant remember anything",
      author: "Watashi",
      url: "https://superblogs.eu/cant-remember-anything",
      likes: 0,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

    const addedBlog = blogsAtEnd[blogsAtEnd.length - 1];
    delete addedBlog.id;

    assert.deepStrictEqual(newBlog, addedBlog);
  });

  test("blog without title or url is not added", async () => {
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

  test("a valid blog without likes property can be added", async () => {
    const newBlog = {
      title: "I cant remember anything",
      author: "Watashi",
      url: "https://superblogs.eu/cant-remember-anything",
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

    const addedBlog = blogsAtEnd[blogsAtEnd.length - 1];

    delete addedBlog.id;
    newBlog.likes = 0;

    assert.deepStrictEqual(addedBlog, newBlog);
  });
});

after(async () => {
  await mongoose.connection.close();
});

const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (_request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const foundBlog = await Blog.findById(request.params.id).populate("user", {
    username: 1,
    name: 1,
  });

  if (foundBlog) {
    response.json(foundBlog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", async (request, response) => {
  const { userId, ...content } = request.body;
  const user = await User.findById(userId);

  if (!user) {
    return response.status(400).json({ error: "userId missing or not valid" });
  }

  const savedBlog = await new Blog({
    ...content,
    user: userId,
  }).save();
  const populated = await savedBlog.populate("user", { username: 1, name: 1 });

  user.blogs = user.blogs.concat(populated._id);
  await user.save();

  response.status(201).json(populated);
});

blogsRouter.put("/:id", async (request, response) => {
  const updatedData = request.body;

  const foundBlog = await Blog.findById(request.params.id);

  if (!foundBlog) {
    return response.status(404).end();
  }

  foundBlog.title = updatedData.title;
  foundBlog.likes = updatedData.likes;

  const savedBlog = await foundBlog.save();

  const populated = await savedBlog.populate("user", {
    username: 1,
    name: 1,
  });

  response.json(populated);
});

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = blogsRouter;

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
  const body = request.body;

  const user = await User.findById(request.user.id);

  const savedBlog = await new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user.id,
  }).save();
  const populated = await savedBlog.populate("user", { username: 1, name: 1 });

  user.blogs = user.blogs.concat(populated._id);
  await user.save();

  response.status(201).json(populated);
});

blogsRouter.put("/:id", async (request, response) => {
  const { likes, title } = request.body;

  const foundBlog = await Blog.findById(request.params.id);

  if (!foundBlog) {
    return response.status(404).end();
  }

  if (title !== undefined) foundBlog.title = title;
  if (likes !== undefined) foundBlog.likes = likes;

  const savedBlog = await foundBlog.save();

  const populated = await savedBlog.populate("user", {
    username: 1,
    name: 1,
  });

  response.json(populated);
});

blogsRouter.delete("/:id", async (request, response) => {
  const user = await User.findById(request.user.id);
  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).end();
  }

  if (blog.user.toString() !== user.id.toString()) {
    return response.status(403).json({ error: "forbidden" });
  }

  await Blog.deleteOne({ _id: request.params.id });
  response.status(204).end();
});

module.exports = blogsRouter;

const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (_request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const foundBlog = await Blog.findById(request.params.id);
  if (foundBlog) {
    response.json(foundBlog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", async (request, response) => {
  const savedBlog = await new Blog(request.body).save();
  response.status(201).json(savedBlog);
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

  response.json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = blogsRouter;

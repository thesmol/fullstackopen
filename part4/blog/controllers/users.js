const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (_request, response) => {
  const users = await User.find({}).populate("blogs", {
    author: 1,
    title: 1,
    likes: 1,
    url: 1,
  });

  response.json(users);
});

usersRouter.get("/:id", async (request, response) => {
  const foundUser = await User.findById(request.params.id).populate("blogs", {
    author: 1,
    title: 1,
    likes: 1,
    url: 1,
  });

  if (foundUser) {
    response.json(foundUser);
  } else {
    response.status(404).end();
  }
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  const errors = [];
  if (password && password.length < 3)
    errors.push("Password must contains at least 3 characters");
  if (username && username.length < 3)
    errors.push("Username must contains at least 3 characters");

  if (errors.length > 0)
    return response.status(400).json({ error: errors.join(", ") });

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  const savedUser = await new User({ username, name, passwordHash }).save();
  response.status(201).json(savedUser);
});

usersRouter.put("/:id", async (request, response) => {
  const { username, name, password } = request.body;

  const foundUser = await User.findById(request.params.id);

  if (!foundUser) {
    return response.status(404).end();
  }

  const errors = [];
  if (password && password.length < 3)
    errors.push("Password must contains at least 3 characters");
  if (username && username.length < 3)
    errors.push("Username must contains at least 3 characters");

  if (errors.length > 0)
    return response.status(400).json({ error: errors.join(", ") });

  foundUser.name = name;
  foundUser.username = username;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  foundUser.passwordHash = passwordHash;

  const savedUser = await foundUser.save();
  const populated = await savedUser.populate("blogs", {
    author: 1,
    title: 1,
    likes: 1,
    url: 1,
  });

  response.json(populated);
});

usersRouter.delete("/:id", async (request, response) => {
  await User.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = usersRouter;

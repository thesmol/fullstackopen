const express = require("express");
const mongoose = require("mongoose");
const blogRoutes = require("./controllers/blogs");
const userRoutes = require("./controllers/users");
const loginRoutes = require("./controllers/login");
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");

const app = express();

logger.info("connecting to", config.MONGODB_URI);
mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) =>
    logger.error("error connection to MongoDB:", error.message),
  );

app.use(express.static("dist"));
app.use(express.json());

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/login", loginRoutes);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

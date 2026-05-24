const express = require("express");
const mongoose = require("mongoose");
const blogRoutes = require("./controllers/blogs");
const config = require("./utils/config");

const app = express();

const mongoUrl = config.MONGODB_URI;
mongoose.connect(mongoUrl, { family: 4 });

app.use(express.json());
app.use("/api/blogs", blogRoutes);

module.exports = app;

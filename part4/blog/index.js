const express = require("express");
const mongoose = require("mongoose");
const blogRoutes = require("./controllers/blogs");
const config = require("./utils/config");
const logger = require("./utils/logger");

const app = express();

const mongoUrl = config.MONGODB_URI;
mongoose.connect(mongoUrl, { family: 4 });

app.use(express.json());
app.use("/api/blogs", blogRoutes);

const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

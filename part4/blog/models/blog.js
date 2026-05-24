const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    minLength: [10, "Blog's title must contains at less 10 characters"],
    required: [true, "Blog's title required"],
  },
  author: {
    type: String,
    minLength: [3, "Author name must contains at less 3 characters"],
    required: [true, "Author name required"],
  },
  url: {
    type: String,
    validate: {
      validator: (v) =>
        /^https?:\/\/([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?(\?[^\s#]*)?(#[^\s]*)?$/.test(
          v,
        ),
      message: (props) => `"${props.value}" is not a valid URL`,
    },
    required: [true, "Blog's URL is required"],
  },
  likes: {
    type: Number,
    min: [0, "Blog can't have less then 0 likes"],
  },
});

blogSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Blog", blogSchema);

const mongoose = require("mongoose");
// const { post } = require("../routes/auth-routes");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  author: String,
});

module.exports = mongoose.model("Post", postSchema);

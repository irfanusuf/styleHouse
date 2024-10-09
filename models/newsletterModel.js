const mongoose = require("mongoose");

const NewsLetter = mongoose.model("NewsLetter", {
  email: { type: String, require: true },
});

module.exports = NewsLetter;

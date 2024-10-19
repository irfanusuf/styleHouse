const mongoose = require("mongoose");

const NewsLetter = mongoose.model("NewsLetter", {
  email: { type: String, require: true },

  offers: [{ offer: { type: String },promo : {type : String} }],
});

module.exports = NewsLetter;

const mongoose = require("mongoose");

const NewsLetter = mongoose.model("NewsLetter", {
  email: { type: String, required: true }, // Fixed the 'required' typo
  offers: [
    {
      offer: { type: String },  // Offer description or title
      promo: { type: String }   // Promo code
    }
  ]
});

module.exports = NewsLetter;

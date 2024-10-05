const mongoose = require("mongoose");

const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,
  profilepicUrl : String,
  addresses: [
    {
      fullname:String,
      street: String,
      city: String,
      state: String,
      contact: String,
      postalCode: String,
      landMark: String,
      country: String,
    },
  ],
  cards: [
    {
      holderName : String,
      cardNumber : String,
      expiry : String,
    }
  ],

  isAdmin : {type : Boolean , default : false},
  isStorekeeper : {type : Boolean , default : false},
  isEmailVerified:{type : Boolean , default : false},
  cartValue: { type: Number },
  cart: [ 
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      price: { type: Number },
      size: { type: String },
      color: { type: String },
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Reference to Order model
    },
  ],
});

module.exports = User;

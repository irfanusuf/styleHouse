// mongo db   instaall
// import mongoose
// mongoose is an ORM

const mongoose = require("mongoose");
const url = "mongodb+srv://irfanusuf33:stylehouse4424@stylehouse.rcc8j.mongodb.net/?retryWrites=true&w=majority&appName=stylehouse"
// const url = "mongodb://localhost:27017/bookStore"

const connectDB = async () => {
  try {

  await  mongoose.connect(url)
  console.log("Database Connected !")

  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;

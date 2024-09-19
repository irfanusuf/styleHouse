const Book = require("../models/itemModel");
const User = require("../models/userModel");

const getAdminPage = async (req, res) => {
  try {
    // const data = await Book.find().lean();

    res.render("admin", {
      pageTitle: "Style house  | AdminDashboard",
      // data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

const getIndexPage = async (req, res) => {
  try {

    if (req.session.id) {
      res.render("userDash", {
        id: req.session.id,
        username: req.session.username,
        cartlength: req.session.cartlength,
        pageTitle: "Style House | Dashboard",
      });
    } else {
      res.render("index", {
        pageTitle: "Style House | Home",
        // data: data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};





const getUserDash = async (req, res) => {
  try {
  
    res.render("userDash", {
      id: req.session.id,
      username: req.session.username,
      cartlength: req.session.cartlength,
      pageTitle: "Style House | Dashboard",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getAdminPage, getIndexPage, getUserDash };

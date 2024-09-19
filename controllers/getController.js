
const Product = require("../models/itemModel");
const Order = require("../models/oderModel");
const User = require("../models/userModel");

const getAdminPage = async (req, res) => {
  try {
    const products = await Product.find().lean();

    // console.log(products)

    const users = await User.find().populate({
      path : 'cart.productId',
      select : 'name price'
    }).populate({
      path : "orders",
      select : "totalAmount"

    }).lean()
    const orders = await Order.find().populate({
      path: 'user',
      select: 'username email', 
    }).populate({
      path: 'products.productId',
      select: 'name price', 
    }).lean();


    res.render("admin", {
      
        id: req.session.id,
        username: req.session.username,
        cartlength: req.session.cartlength,
        pageTitle: "Style house  | AdminDashboard",
        products : products,
        users : users,
        orders :orders
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

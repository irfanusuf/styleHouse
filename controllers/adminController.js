const Product = require("../models/itemModel");
const Order = require("../models/oderModel");
const User = require("../models/userModel");


  const getAdminPage = async (req, res) => {
    try {

      res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email : req.user.email,
        cart: req.user.cart,
        pageTitle: "Style house  | AdminDashboard",
      });
    } catch (error) {
      console.log(error);
      res.render("error", {
        backToPage: "/",
        errorMessage: "Error loading the admin page | Server Error!",
      });
    }
  };

  const getUserReport = async (req, res) => {
    try {
  
      const users = await User.find()
        .populate({
          path: "cart.productId",
        })
        .populate({
          path: "orders",
        })
        .lean();
  
      res.render("userReport", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        email : req.user.email,
        pageTitle: "Style house |admin@userReport",
        users: users,
      });
    } catch (error) {
      console.log(error);
      res.render("admin", {
        backToPage: "/",
        errorMessage: "Error loading the user  Report | Server Error!",
      });
    }
  };

  const getProductReport = async (req, res) => {
    try {
      const products = await Product.find().lean();
  
      res.render("productReport", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        email : req.user.email,
        pageTitle: "Style house  |admin@productReport",
        products: products,
      });
    } catch (error) {
      console.log(error);
      res.render("error", {
        backToPage: "/",
        errorMessage: "Error loading the product Report | Server Error!",
      });
    }
  };
  
  const getOrderReport = async (req, res) => {
    try {
     
      const orders = await Order.find()
        .populate({
          path: "user",
          select: "email",
        })
        .populate({
          path: "products.productId",
          select: "name",
        })
        .lean();
  
      res.render("orderReport", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        email : req.user.email,
        pageTitle: "Style house  | admin@orderReport",
        orders: orders,
      });
    } catch (error) {
      console.log(error);
      res.render("error", {
        backToPage: "/",
        errorMessage: "Error loading the order Report | Server Error!",
      });
    }
  };

  module.exports  = {getAdminPage,getUserReport,getProductReport ,getOrderReport}
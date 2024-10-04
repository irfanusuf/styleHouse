const Product = require("../models/itemModel");
const Order = require("../models/oderModel");
const User = require("../models/userModel");

const getAdminPage = async (req, res) => {
  try {
    const products = await Product.find().lean();

    const users = await User.find()
      .populate({
        path: "cart.productId",
      })
      .populate({
        path: "orders",
      })
      .lean();


    const orders = await Order.find()
      .populate({
        path: "user",
        select : "email"
      })
      .populate({
        path: "products.productId",
        select : "name"
      })
      .lean();

 

    res.render("admin", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style house  | AdminDashboard",
      products: products,
      users: users,
      orders: orders,
    });
  } catch (error) {
    console.log(error);
  }
};

const getIndexPage = async (req, res) => {
  try {
    if (req.userId) {
      res.render("userDash", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
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
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House | Dashboard",
    });
  } catch (error) {
    console.log(error);
  } 
};

const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate(
    { path : "cart.productId"}
    ).lean();

    user.cart.forEach(item => {
      item.total = item.quantity * item.productId.price;
    });


    res.render("cart", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House | Cart",
      user: user,
    });
  } catch (error) {
    console.log(error);
  }
};


const getOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const orders =await Order.find({user : userId}).populate(
      {
        path : "products.productId"
      }
    ).lean()


    //  console.log(orders)
      let message = ""

      if(orders.length === 0){
        message = "No Orders Found !"
      }

    // user.cart.forEach(item => {
    //   item.total = item.quantity * item.productId.price;
    // });

    res.render("orders", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House | orders",
      orders: orders,
      message : message,
    });
  } catch (error) {
    console.log(error);
  }
};




module.exports = {
  getAdminPage,
  getIndexPage,
  getUserDash,
  getCart,
  getOrder
};

const Product = require("../models/itemModel");
const Order = require("../models/oderModel");
const User = require("../models/userModel");


 
const getIndexPage = async (req, res) => {
  try {
    if (req.userId) {
      res.render("index", {
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
    res.render("error", {
      backToPage: "/",
      errorMessage: "Error loading the home page | Server Error!",
    });
  }
};

const getUserDash = async (req, res) => {
  try {
    res.render("index", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House | Dashboard",
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "/",
      errorMessage: "Error loading the home page | Server Error!",
    });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId)
      .populate({ path: "cart.productId" })
      .lean();

    // user.cart.forEach((item) => {
    //   item.total = item.quantity * item.productId.price;
    // });

    res.render("cart", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House | Cart",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "/",
      errorMessage: "Error Loading the cart | Server Error!",
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "products.productId",
      })
      .lean();

    const inverseOrder = orders.reverse();

    let message = "";

    if (orders.length === 0) {
      message = "No Orders Found !";
    }

    res.render("orders", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House | orders",
      orders: inverseOrder,
      message: message,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "/",
      errorMessage: "Error loading the Orders | Server Error!",
    });
  }
};

// const getQuery = async (req, res) => {
//   try {
//     res.render("query", {
//       userId: req.user._id,
//       username: req.user.username,
//       cart: req.user.cart,
//       pageTitle: "Style House | query",
//     });
//   } catch (error) {
//     console.log(error);
//     res.render("error", {
//       backToPage: "",
//       errorMessage: "Error loading the Query! | Server Error!",
//     });
//   }
// };

module.exports = {
  getIndexPage,
  getUserDash,
  getCart,
  getOrder,
  // getQuery,
};

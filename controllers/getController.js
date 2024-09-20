const Product = require("../models/itemModel");
const Order = require("../models/oderModel");
const User = require("../models/userModel");

const getAdminPage = async (req, res) => {
  try {
    const products = await Product.find().lean();

    // console.log(products)

    const users = await User.find()
      .populate({
        path: "cart.productId",
        select: "name price",
      })
      .populate({
        path: "orders",
        select: "totalAmount",
      })
      .lean();

    const orders = await Order.find()
      .populate({
        path: "user",
      })
      .populate({
        path: "products.productId",
      })
      .lean();

    res.render("admin", {
      id: req.userId,
      username: req.username,
      cart: req.cart,
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
        userId: req.userId,
        username: req.username,
        cart: req.cart,
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
      id: req.userId,
      username: req.username,
      cart: req.cart,
      order: req.order,
      pageTitle: "Style House | Dashboard",
    });
  } catch (error) {
    console.log(error);
  }
};

const getMenPage = async (req, res) => {
  try {
    const menProducts = await Product.find({ category: "Men" }).lean();
 
      if(menProducts.length === 0){
        return res.render("menPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Men",
        products: menProducts,
        message: "No products Found!" 
      })
      }
    if (menProducts) {
      res.render("menPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Men",
        products: menProducts,
      });
    } else {
      res.render("menPage", { message: "Network Error!" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getWomenPage = async (req, res) => {
  try {
    const womenProducts = await Product.find({ category: "Women" }).lean();
    
    if(womenProducts.length ===0){
      return res.render("womenPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Women",
        products: womenProducts,
        message: "No products Found!" 
      })
    }


    if (womenProducts) {
      res.render("womenPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Women",
        products: womenProducts,
      });
    } else {
      res.render("WomenPage", { message: "Network Error!" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getKidsPage = async (req, res) => {
  try {
    const kidsProducts = await Product.find({ category: "Kids" }).lean();

    if(kidsProducts.length ===0){
      return res.render("kidsPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Kids",
        products: kidsProducts,
        message : "No products Found!"
      }
        
      )
    }

    if (kidsProducts) {
      res.render("kidsPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Kids",
        products: kidsProducts,
      });
    } else {
      res.render("kidsPage", { message: "Network Error!" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getAccesoriesPage = async (req, res) => {
  try {
    const accProducts = await Product.find({ category: "Accessories" }).lean();

  

    if(accProducts.length === 0){
      return res.render("accesoriesPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Accessories",
        products: accProducts,
        message : "No products Found!"
      })
    }

    if (accProducts) {
      res.render("accesoriesPage", {
        userId: req.userId,
        username: req.username,
        cart: req.cart,
        pageTitle: "Style House | Accessories",
        products: accProducts,
      });
    } else {
      res.render("accesoriesPage", { message: "Network Error!" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAdminPage,
  getIndexPage,
  getUserDash,
  getMenPage,
  getWomenPage,
  getKidsPage,
  getAccesoriesPage,
};

const Product = require("../models/itemModel");

const errorHandler = (
  res,
  statusCode = 200,
  page,
  success = true,
  message = "done"
) => {
  return res
    .status(statusCode)
    .render(page, { sucess: success, message: message });
};

const renderCategoryPage = async (req, res, category) => {
  try {
    const products = await Product.find({ category: category }).lean();

    if (products.length === 0) {
      return res.render("productPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House |${category}`,
        products,
        message: "No products Found!",
      });
    }

    res.render("productPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House |${category}`,
      products,
    });
  } catch (error) {
    console.log(error);
    res.render("productPage", { message: "Network Error!" });
  }
};

const renderSubCategoryPage = async (req, res, subCategory) => {
  try {
   

    const products = await Product.find({
      $or: [
        { subCategory: { $regex: subCategory, $options: "i" } }, 
      ],
    }).lean();




    if (products.length === 0) {
      return res.render("productPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | ${subCategory}`,
        products,
        message: "No products Found!",
      });
    }

    res.render("productPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | ${subCategory}`,
      products,
    });
  } catch (error) {
    console.log(error);
    res.render("productPage", { message: "Network Error!" });
  }
};

const renderPageSearchProducts = async (req, res) => {
  try {

    const {search_query} = req.body

    const products = await Product.find({
      $or: [
        { name: { $regex: search_query, $options: "i" } }, 
        { category: { $regex: search_query, $options: "i" } }, 
        { subCategory: { $regex: search_query, $options: "i" } }, 
        { searchTag: { $regex: search_query, $options: "i" } }, 
      ],
    }).lean();

    if (products.length === 0) {
      return res.render("productPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | Search`,
        products,
        message: "No products Found!",
      });
    }

    res.render("productPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | Search`,
      products,
    });
  } catch (error) {
    console.log(error);
    res.render("productPage", { message: "Network Error!" });
  }
};

module.exports = {
  errorHandler,
  renderCategoryPage,
  renderSubCategoryPage,
  renderPageSearchProducts,
};

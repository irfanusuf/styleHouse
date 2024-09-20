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

const renderProductPage = async (req, res, category) => {
  try {
    const products = await Product.find({ searchTag: category }).lean();

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

const renderCategoryPage = async (req,res ,category)=>{
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
}





module.exports = { errorHandler, renderProductPage ,renderCategoryPage};

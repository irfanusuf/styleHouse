const Product = require("../models/itemModel");



const renderCategoryPage = async (req, res, category) => {
  try {
    const products = await Product.find({ category: category }).lean();

   
 
    if (products.length === 0) {
      return res.render("productPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | ${category}`,
        message: "No products Found!",
      });
    }


    const productsWithSizes = products.map(product => {
      return {
        ...product,
        sizesArray: typeof product.size === 'string' ? product.size.split(',').map(size => size.trim()) : [],
        colorsArray: typeof product.color === 'string' ? product.color.split(',').map(color => color.trim()) : [],
      };
    });
 
    res.render("productPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | ${category}`,
      products : productsWithSizes 
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

    const productsWithSizes = products.map(product => {
      return {
        ...product,
        sizesArray: typeof product.size === 'string' ? product.size.split(',').map(size => size.trim()) : [],
        colorsArray: typeof product.color === 'string' ? product.color.split(',').map(color => color.trim()) : [],
      };
    });
 


    if (products.length === 0) {
      return res.render("productPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | ${subCategory}`,
        message: "No products Found!",
      });
    }

    res.render("productPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | ${subCategory}`,
      products : productsWithSizes,
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

    const productsWithSizes = products.map(product => {
      return {
        ...product,
        sizesArray: typeof product.size === 'string' ? product.size.split(',').map(size => size.trim()) : [],
        colorsArray: typeof product.color === 'string' ? product.color.split(',').map(color => color.trim()) : [],
      };
    });

    if (products.length === 0) {
      return res.render("productPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | Search`,
        message: "No products Found!",
      });
    }

    res.render("productPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | Search`,
      products : productsWithSizes,
    });
  } catch (error) {
    console.log(error);
    res.render("productPage", { message: "Network Error!" });
  }
};

const renderfilteredProducts = async (req, res) => {
  try {
    const { size, color, name } = req.body;

    // console.log(req.body);

    const products = await Product.find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { searchTag: { $regex: name, $options: "i" } },
      ],
      size: { $regex: size, $options: "i" },
      color: { $regex: color, $options: "i" },
    }).lean();

   
    const productsWithSizes = products.map(product => ({
      ...product,
      sizesArray: typeof product.size === 'string' ? product.size.split(',').map(size => size.trim()) : [],
      colorsArray: typeof product.color === 'string' ? product.color.split(',').map(color => color.trim()) : [],
    }));

   
    if (productsWithSizes.length === 0) {
      return res.render("productPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | Search`,
        message: "No products found!",
      });
    }

 
    res.render("productPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | Search`,
      products: productsWithSizes,
    });
  } catch (error) {
    console.error(error);
    res.render("productPage", { message: "Network Error!" });
  }
};



module.exports = {
  renderCategoryPage,
  renderSubCategoryPage,
  renderPageSearchProducts,
  renderfilteredProducts
};

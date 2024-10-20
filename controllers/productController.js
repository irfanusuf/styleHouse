const cloudinary = require("cloudinary").v2;
const Product = require("../models/itemModel");
const Item = require("../models/itemModel");
const errorHandler = require("./renderController");

cloudinary.config({
  cloud_name: "dbo0xmbd7",
  api_key: "717735839128615",
  api_secret: "fqcjtd3HxpH_t1dAEtqr595ULW0",
});

//admin  routes


const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      subCategory,
      searchTag,
      size,
      color,
      price,
      discount,
      itemQty,
    } = req.body;

    if (
      name !== "" &&
      category !== "" &&
      subCategory !== "" &&
      searchTag !== "" &&
      size !== "" &&
      color !== "" &&
      price !== "" &&
      discount !== "" &&
      itemQty !== "" &&
      description !== ""
    ) {
      const image = req.file.path;

      const fileUpload = await cloudinary.uploader.upload(image, {
        folder: "style-house",
      });

      const imageUrl = fileUpload.secure_url;

      const product = await new Product({
        name,
        category,
        subCategory,
        searchTag,
        size,
        color,
        price,
        discount,
        itemQty,
        description,
        imageUrl,
      });
      const save = await product.save();

      if (save) {
        res.redirect("/admin/dashboard/productReport");
      } else {
        res.render("admin", {
          message: "Some Error during saving ",
        });
      }
    } else {
      res.render("admin", { message: "All Details Required" });
    }
  } catch (err) {
    console.log(err);
  }
};

const editProduct = async (req, res) => {
  try {
    const _id = req.params.id;

    const {
      name,
      category,
      subCategory,
      searchTag,
      size,
      color,
      price,
      discount,
      itemQty,
    } = req.body;

    // const image = req.file.path;

    // if (!image || image === undefined) {
    //   return res.render("admin", { message: "No image Selected" });
    // }

    // const fileUpload = await cloudinary.uploader.upload(req.file.path, {
    //   folder: "style-house",
    // });

    // const imageUrl = fileUpload.secure_url;

    const updateProduct = await Product.findByIdAndUpdate(_id, {
      name: name,
      category: category,
      searchTag: searchTag,
      size: size,
      color: color,
      price: price,
      discount: discount,
      itemQty: itemQty,
      subCategory: subCategory,
      // imageUrl : imageUrl
    });

    if (updateProduct) {
      return res.redirect("/admin/dashboard/productReport");
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const _id = req.params.id;

    const delItem = await Product.findByIdAndDelete(_id);

    if (delItem) {
      return res.redirect("/admin/dashboard/productReport");
    } else {
      return res.render("admin", { message: "Some Error" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate({
      path : "reviews.user"
    }).lean();


    const search_query = product.searchTag;
    const products = await Product.find({
      $or: [
        { name: { $regex: search_query, $options: "i" } },
        // { category: { $regex: search_query, $options: "i" } },
        { subCategory: { $regex: search_query, $options: "i" } },
        { searchTag: { $regex: search_query, $options: "i" } },
      ],
    }).lean();


    let recommendation = ""
    if(products.length ===0){
      recommendation = "No Recommended Products!"
    }

    if (product.length === 0) {
      return res.render("singleproductPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | ${search_query}`,
        message: "No products Found!",
      });
    }

    const productSizeColorArr = products.map((product) => {
      return {
        ...product,
        sizesArray:
          typeof product.size === "string"
            ? product.size.split(",").map((size) => size.trim())
            : [],
        colorsArray:
          typeof product.color === "string"
            ? product.color.split(",").map((color) => color.trim())
            : [],
      };
    });

    const productSizeColorObj = {
      ...product,
      sizesArray:
        typeof product.size === "string"
          ? product.size.split(",").map((size) => size.trim())
          : [],
      colorsArray:
        typeof product.color === "string"
          ? product.color.split(",").map((color) => color.trim())
          : [],
    };

    res.render("singleproductPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | ${search_query}`,
      products: productSizeColorArr,
      product: productSizeColorObj,
      recommend : recommendation
    });
  } catch (error) {
    console.log(error);
  }
};

const addProductReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { review, star } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).render("error", { message: "Product not found" });
    }

    // Use findIndex to find if the user has already reviewed the product
    const reviewIndex = product.reviews.findIndex(
      (r) => r.user.toString() === userId
    );


    if (reviewIndex !== -1) {
      return res
        .status(400)
        .render("error", { message: "Product already reviewed by this user" });
    }

    // Add the new review
    const newReview = {
      user: userId,
      review: review,
      star: star,
    };

    product.reviews.push(newReview);

    // Calculate the new average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.star + acc, 0) /
      product.reviews.length;

    // Save the updated product
    await product.save();

    res.redirect(`/product/${productId}`);
  } catch (error) {
    console.log(error);
    res.render("error", { message: "Server Error" });
  }
};


module.exports = {
  createProduct,
  editProduct,
  deleteProduct,
  getProduct,
  addProductReview,
};

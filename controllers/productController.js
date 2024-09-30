const cloudinary = require("cloudinary").v2;
const Product = require("../models/itemModel");
const Item = require("../models/itemModel");
const errorHandler = require("../utils/feature");

cloudinary.config({
  cloud_name: "dbo0xmbd7",
  api_key: "717735839128615",
  api_secret: "fqcjtd3HxpH_t1dAEtqr595ULW0",
});

const createProduct = async (req, res) => {
  try {
    const { name, category, description, searchTag, size, color, price, discount, itemQty } =
      req.body;

    if (
      name !== "" &&
      category !== "" &&
      searchTag !== "" &&
      size !== "" &&
      color !== "" &&
      price !== "" &&
      discount !== "" &&
      itemQty !== ""&&
      description !==""
    ) {
      const image = req.file.path;

      const fileUpload = await cloudinary.uploader.upload(image, {
        folder: "style-house",
      });

      const imageUrl = fileUpload.secure_url;

      const product = await new Product({
        name,
        category,
        searchTag,
        size,
        color,
        price,
        discount,
        itemQty,
        description,
        imageUrl
      });
      const save = await product.save();

      if (save) {
        res.redirect("/admin/dashboard");
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

    const { name, category,subCategory, searchTag, size, color, price, discount, itemQty } = req.body;

    // const image = req.file.path;

    // if (!image || image === undefined) {
    //   return res.render("admin", { message: "No image Selected" });
    // }

    // const fileUpload = await cloudinary.uploader.upload(req.file.path, {
    //   folder: "style-house",
    // });

    // const imageUrl = fileUpload.secure_url;

    const updateProduct = await Product.findByIdAndUpdate(_id, 
      {
        name : name ,
        category : category,
        searchTag : searchTag,
        size :size,
        color: color,
        price :price,
        discount : discount,
        itemQty :itemQty,
        subCategory: subCategory
        // imageUrl : imageUrl
      }
    );

    if (updateProduct) {
      return res.redirect("/admin/dashboard");
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
      return res.redirect("/admin/dashboard");
    } else {
      return res.render("admin", { message: "Some Error" });
    }
  } catch (error) {
    console.log(error);
  }
};


const getProduct = async (req,res) =>{
  

  try {
    const {productId} =  req.params
    const product = await Product.findById(productId).lean()
    const search_query = product.category
    const products = await Product.find({
      $or: [
        { name: { $regex: search_query, $options: "i" } }, 
        { category: { $regex: search_query, $options: "i" } }, 
        { subCategory: { $regex: search_query, $options: "i" } }, 
        { searchTag: { $regex: search_query, $options: "i" } }, 
      ],
    }).lean();

  


    if (products.length === 0) {
      return res.render("singleproductPage", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | ${search_query}`,
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

    const productWithSizes = {
      ...product,
      sizesArray: typeof product.size === 'string' ? product.size.split(',').map(size => size.trim()) : [],
      colorsArray: typeof product.color === 'string' ? product.color.split(',').map(color => color.trim()) : [],
    };
    
 
    res.render("singleproductPage", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | ${search_query}`,
      products : productsWithSizes ,
      product :productWithSizes
    });
 
    
  } catch (error) {
    console.log(error)
  }

}


module.exports = { createProduct, editProduct, deleteProduct ,getProduct};

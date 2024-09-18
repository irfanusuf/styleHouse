const cloudinary = require("cloudinary").v2;
const Item = require("../models/itemModel");
const errorHandler = require("../utils/feature");

cloudinary.config({
  cloud_name: "dbo0xmbd7",
  api_key: "717735839128615",
  api_secret: "fqcjtd3HxpH_t1dAEtqr595ULW0",
});

const createItem = async (req, res) => {
  try {
    const { itemTitle, itemAuthor, itemDescription, itemPrice } = req.body;

    if (
      itemTitle !== "" &&
      itemAuthor !== "" &&
      itemDescription !== "" &&
      itemPrice !== ""
    ) {
      const image = req.file.path;

      const fileUpload = await cloudinary.uploader.upload(image, {
        folder: "style-house",
      });

      const itemImgUrl = fileUpload.secure_url;

      const item = await new item({
        itemTitle,
        itemAuthor,
        itemDescription,
        itemPrice,
        itemImgUrl,
      });
      const save = await item.save();

      if (save) {
        res.redirect("/admin/dashboard");
      } else {
        res.redirect("/admin/dashboard", {
          message: "Some Error during saving ",
        });
      }
    } else {
      res.redirect("/admin/dashboard", { message: "All Details Required" });
    }
  } catch (err) {
    console.log(err);
  }
};

const editItem = async (req, res) => {
  try {
    const _id = req.params.id;

    const { itemTitle, itemAuthor, itemDescription, itemPrice } = req.body;

    // const image = req.file.path;

    // if (!image) {
    //   return res.render("secureHome", { message: "No image Selected" });
    // }

    const fileUpload = await cloudinary.uploader.upload(req.file.path, {
      folder: "item_Delights",
    });

    const itemImgUrl = fileUpload.secure_url;

    const item = await item.findByIdAndUpdate(_id, {
      itemTitle: itemTitle,
      itemAuthor: itemAuthor,
      itemDescription: itemDescription,
      itemPrice: itemPrice,
      itemImgUrl: itemImgUrl,
    });

    if (item) {
      return res.redirect("/secureIndex");
    }
  } catch (error) {
    console.log("image Error");
  }
};

const deleteItem = async (req, res) => {
  try {
    const _id = req.params.id;

    const delItem = await Item.findByIdAndDelete(_id);

    if (delItem) {
      return res.redirect("/admin/dashboard");
    } else {
      return res.render("admin", { message: "Some Error" });
    }
  } catch (error) {
    console.log(error);
  }
};

const itemPayment = async (req, res) => {
  try {
  
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createItem, editItem, deleteItem, itemPayment };

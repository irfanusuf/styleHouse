const Book = require("../models/itemModel");

const getAdminPage = async (req, res) => {
    try {
    
      // const data = await Book.find().lean();
  
      res.render("admin", {
        pageTitle: "Style house  | AdminDashboard",
        // data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };


  const getIndexPage = async (req, res) => {
    try {
    
      // let arr = await Book.find().lean();
  
      // const data = arr.slice(0, 8);
  
      res.render("index", {
        pageTitle: "Style House | Home",
        // data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  module.exports = {getAdminPage ,getIndexPage}
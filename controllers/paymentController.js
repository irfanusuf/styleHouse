const Order = require("../models/oderModel");
const User = require("../models/userModel");


const checkout = async (req, res) => {
    try {
      const userId = req.userId;
      const {orderId} =req.params
  
      const user = await User.findById(userId).lean();

      const order = await Order.findById(orderId).populate({
        path: "products.productId",
      }).lean();


      let address = {}
      let card = {}

      if(user.addresses){
         address = user.addresses[0]
      }
   
      if(user.cards){
         card =  user.cards[0]
      }

      return res.render("checkout", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | checkout`,
        order,
        user,
        address,
        card
      });
    } catch (error) {
      console.error(error);
      res.render("cart", { message: "An error occurred during checkout." });
    }
  };











const productPayment = async (req, res) => {
    try {
      res.render("paymentCheckout" , {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | payment`,
        message : "your Email is Verified , proceed for payment"
      })
    } catch (error) {
      console.log(error);
    }
  };



  module.exports ={checkout , productPayment}
const Order = require("../models/oderModel");
const Product = require("../models/itemModel");
const User = require("../models/userModel");

const createOrder = async (req, res) => {
    try {
      const userId = req.userId;
      const productId = req.params.productId;
      const { quantity , size , color} = req.body;
  
  
      
  
      const user = await User.findById(userId);
      if (!user) {
        return res.render("checkout", { message: "Some Error, Kindly Login again!" });
      }
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.render("checkout", { message: "Product unavailable! " });
      }
  
      const totalAmount = product.price * quantity;
  
      const newOrder = new Order({
        user: userId,
        products: [
          {
            productId: productId,
            quantity: quantity,
            price: product.price,
            size : size ,
            color :color
          },
        ],
        totalAmount: totalAmount,
        status: "pending",
      });
  
      const savedOrder = await newOrder.save();
  
      user.orders.push(savedOrder._id);
      await user.save();
  
      res.redirect("/order/checkout")
      
    } catch (error) {
      console.error("Error creating order:", error);
      res.render("cart", { message: "An error occurred during checkout." });
    }
  };


const createCartOrder = async (req, res) => {
    try {
      const userId = req.userId;
  
      const user = await User.findById(userId)
  
      if (!user || user.cart.length === 0) {
        return res.render("cart", { message: "Your cart is empty !" });
      }
  
      let totalAmount = 0;
      const productsInCart = [];
  
      for (const cartItem of user.cart) {
        const product = cartItem.productId;
  
        if (!product) {
          return res.render("cart", {
            message: `Product with ID ${cartItem.productId} is unavailable!`,
          });
        }
  
        const itemTotal = cartItem.price * cartItem.quantity;
  
        totalAmount += itemTotal;
  
        productsInCart.push({
          productId: product._id,
          quantity: cartItem.quantity,
          price: cartItem.price,
          color : cartItem.color,
          size : cartItem.size
        });
      }
  
      const newOrder = new Order({
        user: userId,
        products: productsInCart,
        totalAmount: totalAmount,
        status: "pending",
      });
  
      const savedOrder = await newOrder.save();
  
      user.orders.push(savedOrder._id);
  
      // user.cart = [];
  
      await user.save();
  
      res.redirect("/order/checkout");
    } catch (error) {
      console.error("Error creating order:", error);
      res.render("cart", { message: "An error occurred during checkout." });
    }
};
  


const deleteorder = async(req,res) =>{
    try{
      const id = req.params.orderId
      const delOrder = await Order.findByIdAndDelete(id)
      if(delOrder) {
        res.redirect("/admin/dashboard")
      }
    }
    catch(error){
      console.log(error)
    }


}


const dispatchOrder = async(req,res) =>{
  console.log("dipatch call")
}


module.exports = {createOrder , createCartOrder ,deleteorder ,dispatchOrder} 
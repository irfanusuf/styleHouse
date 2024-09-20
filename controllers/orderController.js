const Product = require('../models/itemModel'); 
const User = require('../models/userModel'); 
const Order = require('../models/oderModel'); 

const createOrder = async (req, res) => {
  try {
    // const userId = req.session.id; 
    const userId = "66ebcb44f24e5d1286bdc20d"; 
    const productId = req.params.productId; 
    const { quantity } = req.body; 

    const user = await User.findById(userId);
    if (!user) {
      return res.render("cart" ,{message : "Some Error, Kindly Login again!"})
    }

   
    const product = await Product.findById(productId);
    if (!product) {
      return res.render("cart" , {message : "Product unavailable! "})
    }

   
    const totalAmount = product.price * quantity;

    
    const newOrder = new Order({
      user: userId,
      products: [
        {
          productId: productId,
          quantity: quantity,
          price : product.price
        }
      ],
      totalAmount: totalAmount,
      status: 'pending' 
    });

  
    const savedOrder = await newOrder.save();

  
    user.orders.push(savedOrder._id);
    await user.save();

   
    res.render("payment" , {message :  "We have sent u a verification Email . Kindly click the Verify in the Email and Complete the payment for placing the order, "})
  } catch (error) {
    console.error('Error creating order:', error);
    res.render("cart", { message: "An error occurred during checkout." });
  }
};


const addToCart= async (req, res) => {
  try {
    const userId = req.userId; 
    const productId = req.params.productId; 
    const { quantity } = req.body; 

   
    const user = await User.findById(userId);
    if (!user) {
      return res.render("productPage" , {message : "Some Error , Kindly Login Again!"})
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.render("productPage" , {message : "Product Not available"})
    }

    const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += parseInt(quantity);
    } else {
      user.cart.push({
        productId: product._id,
        quantity: parseInt(quantity),
      });
    }

     // Fetch all product prices for the cart
     const productIds = user.cart.map(item => item.productId);
     const productsInCart = await Product.find({ _id: { $in: productIds } });
 
     // Recalculate cartValue based on all products
     user.cartValue = user.cart.reduce((acc, item) => {
       const itemProduct = productsInCart.find(product => product._id.toString() === item.productId.toString());
       return acc + (item.quantity * (itemProduct ? itemProduct.price : 0));
     }, 0);

    await user.save();

   return res.redirect("/user/cart")
  } catch (error) {
    console.error(error);
    
  }
};


const removeFromCart = async (req, res) => {
    try {
      const userId = req.session.userId;
      const productId = req.params.productId; 
  
      const user = await User.findById(userId);
      if (!user) {
        return res.render("cart", { message: "Some error, Kindly Login again." });
      }
  
     
      const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
  
      if (cartItemIndex > -1) {
       
        user.cart.splice(cartItemIndex, 1);
      } else {
        return res.render("cart", { message: "Product not found in cart." });
      }
  
    
      const productIds = user.cart.map(item => item.productId);
      const productsInCart = await Product.find({ _id: { $in: productIds } });
  
      user.cartValue = user.cart.reduce((acc, item) => {
        const itemProduct = productsInCart.find(product => product._id.toString() === item.productId.toString());
        return acc + (item.quantity * (itemProduct ? itemProduct.price : 0));
      }, 0);
  
      await user.save();
  
      return res.redirect("/user/cart");
    } catch (error) {
      console.error(error);
      res.render("cart", { message: "An error occurred while removing the item from the cart." });
    }
  };
  

const emptyCart = async (req, res) => {
    try {
      const userId = req.session.userId;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.render("cart", { message: "Some Error , Kindly Login Again !" });
      }
  
      // Clear the cart
      user.cart = [];
      user.cartValue = 0; // Reset cart value
  
      await user.save();
  
      return res.redirect("/user/cart");
    } catch (error) {
      console.error(error);
      res.render("cartPage", { message: "An error occurred while emptying the cart." });
    }
  };
  


const checkout = async (req, res) => {
    try {
      const userId = req.session.userId;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.render("cartPage", { message: "User not found, please log in." });
      }
  
      if (user.cart.length === 0) {
        return res.render("cartPage", { message: "Your cart is empty." });
      }
  
      const productsInCart = user.cart;
      const totalAmount = productsInCart.reduce((acc, item) => {
        return acc + (item.quantity * item.price); 
      }, 0);
  
    
      const newOrder = new Order({
        user: user._id,
        products: productsInCart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price : item.price
        })),
        totalAmount:totalAmount,
      });
  
      
      await newOrder.save();
  
     
      user.orders.push(newOrder._id);
      user.cart = []; 
      user.cartValue = 0; 
      await user.save();
  
     return res.render("payment" , {message :  "We have sent u a verification Email . Kindly click the Verify in the Email and Complete the payment for placing the order, "})
    } catch (error) {
      console.error(error);
      res.render("cart", { message: "An error occurred during checkout." });
    }
  };
  
module.exports = {createOrder ,addToCart ,removeFromCart , emptyCart ,checkout}  ;

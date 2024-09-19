const Product = require('../models/itemModel'); 
const User = require('../models/userModel'); 
const Order = require('../models/oderModel'); 

const createOrder = async (req, res) => {
  try {
    const userId = req.session.id; 
    const productId = req.params.productId; 
    const { quantity } = req.body; 

    const user = await User.findById(userId);
    if (!user) {
      return res.render("cart" ,{message : "Some Error, Kindly Login again!"})
    }

   
    const product = await Product.findById(productId);
    if (!product) {
      return res.render("cart" , {message : "Product unavialble! "})
    }

   
    const totalAmount = product.price * quantity;

    
    const newOrder = new Order({
      user: userId,
      products: [
        {
          productId: productId,
          quantity: quantity,
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
    res.status(500).send('Server error');
  }
};





const addToCart= async (req, res) => {
  try {
    const userId = req.session.userId; 
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

    user.cartValue = user.cart.reduce((acc, item) => {
        const productPrice = product.price;
        return acc + item.quantity * productPrice;
      }, 0);

    await user.save();

   return res.redirect("/user/cart")
  } catch (error) {
    console.error(error);
    
  }
};





module.exports = {createOrder ,addToCart};

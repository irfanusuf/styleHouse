const Product = require("../models/itemModel");
const User = require("../models/userModel");



const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId;
    const { quantity ,size, color  } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.render("productPage", {
        message: "Some Error , Kindly Login Again!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.render("productPage", { message: "Product Not available" });
    }

    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += parseInt(quantity);
    } else {
      user.cart.push({
        productId: product._id,
        quantity: parseInt(quantity),
        price: product.price,
        color :color,
        size : size
      });
    }

    
    const productIds = user.cart.map((item) => item.productId);
    const productsInCart = await Product.find({ _id: { $in: productIds } });

    
    user.cartValue = user.cart.reduce((acc, item) => {
      const itemProduct = productsInCart.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return acc + item.quantity * (itemProduct ? itemProduct.price : 0);
    }, 0);

    await user.save();

    return res.redirect("/user/cart");
  } catch (error) {
    console.error(error);
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user;
    const productId = req.params.productId;

    const user = await User.findById(userId);
    if (!user) {
      return res.render("cart", { message: "Some error, Kindly Login again." });
    }

    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex > -1) {
      user.cart.splice(cartItemIndex, 1);
    } else {
      return res.render("cart", { message: "Product not found in cart." });
    }

    const productIds = user.cart.map((item) => item.productId);
    const productsInCart = await Product.find({ _id: { $in: productIds } });

    user.cartValue = user.cart.reduce((acc, item) => {
      const itemProduct = productsInCart.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return acc + item.quantity * (itemProduct ? itemProduct.price : 0);
    }, 0);

    await user.save();

    return res.redirect("/user/cart");
  } catch (error) {
    console.error(error);
    res.render("cart", {
      message: "An error occurred while removing the item from the cart.",
    });
  }
};

const emptyCart = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.render("cart", {
        message: "Some Error , Kindly Login Again !",
      });
    }

  
    user.cart = [];
    user.cartValue = 0; 

    await user.save();

    return res.redirect("/user/cart");
  } catch (error) {
    console.error(error);
    res.render("cart", {
      message: "An error occurred while emptying the cart.",
    });
  }
};




module.exports = {
  addToCart,
  removeFromCart,
  emptyCart,
};


// const checkout = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.render("cartPage", { message: "User not found, please log in." });
//     }

//     if (user.cart.length === 0) {
//       return res.render("cartPage", { message: "Your cart is empty." });
//     }

//     const productsInCart = user.cart;
//     const totalAmount = productsInCart.reduce((acc, item) => {
//       return acc + (item.quantity * item.price);
//     }, 0);

//     const newOrder = new Order({
//       user: user._id,
//       products: productsInCart.map(item => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price : item.price
//       })),
//       totalAmount:totalAmount,
//     });

//     await newOrder.save();

//     user.orders.push(newOrder._id);
//     user.cart = [];
//     user.cartValue = 0;
//     await user.save();

//    return res.render("payment" , {message :  "We have sent u a verification Email . Kindly click the Verify in the Email and Complete the payment for placing the order, "})
//   } catch (error) {
//     console.error(error);
//     res.render("cart", { message: "An error occurred during checkout." });
//   }
// };

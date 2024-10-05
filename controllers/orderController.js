const Order = require("../models/oderModel");
const Product = require("../models/itemModel");
const User = require("../models/userModel");
const { transporter } = require("../utils/nodemailer");

const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.productId;
    const { quantity, size, color } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.render("checkout", {
        message: "Some Error, Kindly Login again!",
      });
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
          size: size,
          color: color,
        },
      ],
      totalAmount: totalAmount,
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    user.orders.push(savedOrder._id);
    await user.save();

    res.redirect("/order/checkout");
  } catch (error) {
    console.error("Error creating order:", error);
    res.render("cart", { message: "An error occurred during checkout." });
  }
};

const createCartOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user || user.cart.length === 0) {
      return res.render("cart", { message: "Your cart is empty !" });
    }

    let totalAmount = 0;
    const productsInCart = [];
    const address = user.addresses[0];



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
        color: cartItem.color,
        size: cartItem.size,
      });
    }

    const newOrder = new Order({
      user: userId,
      products: productsInCart,
      totalAmount: totalAmount,
      status: "pending",
      address: address,
    });

    const savedOrder = await newOrder.save();

    user.orders.push(savedOrder._id);

    // user.cart = [];

    await user.save();

    res.redirect(`/order/checkout/${newOrder._id}`);
  } catch (error) {
    console.error("Error creating order:", error);
    res.render("cart", { message: "An error occurred during checkout." });
  }
};

const deleteorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const delOrder = await Order.findByIdAndDelete(orderId);

    if (delOrder) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { orders: orderId } },
        { new: true }
      );

      if (updatedUser) {
        return res.redirect("/admin/dashboard");
      }
    }
  } catch (error) {
    console.log(error);
    res.render("admin", { message: "Error canceling the order" });
  }
};

const orderAddAddress = async (req,res) =>{


}


const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    if (userId === "" || orderId === "") {
      return res.render("cart", { message: "Error canceling the order" });
    }

    const delOrder = await Order.findByIdAndDelete(orderId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { orders: orderId } },
      { new: true }
    );

    if (delOrder && updatedUser) {
      return res.redirect("/user/orders");
    }
  } catch (error) {
    console.log(error);
    res.render("cart", { message: "Error canceling the order" });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user")
      .populate("products.productId");

    if (!order) {
      return res
        .status(404)
        .render("cart", { message: "Some Error With the Order Id" });
    }

    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/order/update/${orderId}`;

    // http://localhost/order/update/orderid

    // Nodemailer options
    const mailOptions = {
      from: '"Style house" <services@stylehouse.world>',
      to: order.user.email,
      subject: "Verify Your Order",
      text: "Below are the Details of your order, Kindly verify the order",
      bcc: "services@stylehouse.world",
      html: `
          <h1>Order Verification</h1>
        <p>Hello ${order.user.username},</p>
        <p>Thank you for your order! Please verify your email to confirm the order.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          ${order.products
            .map(
              (product) => `
            <li>Product: ${product.productId.name}, Quantity: ${product.quantity}, Price: ${product.price}</li>
          `
            )
            .join("")}
        </ul>
        <p>Total Amount: ${order.totalAmount}</p>
        <a href="${verificationLink}" style="padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none;">Verify Order</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.redirect("/user/orders");
  } catch (error) {
    console.log(error);
    res.render("cart", { message: "Server Error" });
  }
};

const updateOrderEmailVerification = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { emailVerified: true },
      { new: true }
    );
    if (!order) {
      return res.render("cart", { message: "Order not found" });
    }

    return res.redirect(`/user/orders`);
  } catch (error) {
    console.log(error);

    return res.render("cart", { message: "Error verifying email" });
  }
};

const cancelOrderRequest = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(orderId, { cancelRequest: true }, { new: true }).populate({ path: "user" })
    .lean();

    if (!order) {
      return res.status(404).render('orders', {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House | Order cancel",
      message: 'Order not found !.' });
    }

    const userEmail = order.user.email;

    if (order) {
      let mailOptions = {
        from: '"Style house | Cancel Order" <services@stylehouse.world>',
        to: "services@stylehouse.world",
        subject: `Order Cancellation Request for Order ID: ${orderId}`,
        text: `Dear Admin, User with email: ${userEmail} has requested to cancel the order with ID: ${orderId}. \nPlease take the necessary action.\n\nThank you.`,
      };


      await transporter.sendMail(mailOptions);

      res.render("orders", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style House  | Order cancel",
        message:
          "Cancellation request sent successfully! , You refund will be intiated between 24 hours to seven days max. ",
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.render("orders", {
      message: "Failed to send cancellation request. Please try again.",
    });
  }
};

const dispatchOrder = async (req, res) => {
  console.log("dipatch call");
};

module.exports = {
  createOrder,
  createCartOrder,
  deleteorder,
  orderAddAddress,
  dispatchOrder,
  cancelOrder,
  verifyOrder,
  updateOrderEmailVerification,
  cancelOrderRequest,
};

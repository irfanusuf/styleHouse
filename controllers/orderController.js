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
    const { quantities } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user || user.cart.length === 0) {
      return res.render("cart", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: "Style House | Cart",
        message: "Your cart is empty!",
      });
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

      const updatedQuantity = quantities[cartItem.productId];
      const finalQuantity = updatedQuantity
        ? parseInt(updatedQuantity)
        : cartItem.quantity;
      cartItem.quantity = finalQuantity;

      const itemTotal = cartItem.price * finalQuantity;
      totalAmount += itemTotal;

      productsInCart.push({
        productId: product._id,
        quantity: finalQuantity,
        price: cartItem.price,
        color: cartItem.color,
        size: cartItem.size,
      });
    }

    // Create a new order
    const newOrder = new Order({
      user: userId,
      products: productsInCart,
      totalAmount: totalAmount,
      status: "pending",
      address: address,
    });

    const savedOrder = await newOrder.save();

    user.orders.push(savedOrder._id);

    await user.save();

    res.redirect(`/order/checkout/${newOrder._id}`);
  } catch (error) {
    console.error("Error creating order:", error);
    res.render("cart", { message: "An error occurred during checkout." });
  }
};
// admin controller
const deleteorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const delOrder = await Order.findByIdAndDelete(orderId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { orders: orderId } },
      { new: true }
    );

    if (delOrder && updatedUser) {
      return res.redirect("/admin/dashboard/orderReport");
    }
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "/admin/dashboard/orderReport",
      errorMessage: "Error deleting the order | Server Error!",
    });
  }
};
// user cancels the order before payment
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    if (userId === "" || orderId === "") {
      return res.render("error", {
        backToPage: "/user/orders",
        errorMessage:
          "Some Error while canceling order , kindly try again after Sometime !",
      });
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
    res.render("error", {
      backToPage: "/user/orders",
      errorMessage: "Error canceling the order | server Error!",
    });
  }
};
// confirm order  with updated addresss
const orderAddAddress = async (req, res) => {

  const { orderId } = req.params;
  try {
    
    const user = req.user;

    const address = user.addresses[0];

    if (!address || address === undefined) {
      return res.render("error", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        errorMessage: "kindly Add Address!",
        backToPage: `/order/checkout/${orderId}`,
      });
    }

    const updateOrder = await Order.findByIdAndUpdate(orderId, {
      $set: { address: [address] },
    });

    if (updateOrder) {
      return res.redirect("/user/orders");
    }
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: `/order/checkout/${orderId}`,
      errorMessage: "Error adding the Address | Server Error!",
    });
  }
};
//send mail to the user for verification
const verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user")
      .populate("products.productId");

    if (!order) {
      return res.status(404).render("error", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        errorMessage: "Some Error With the Order Id",
        backToPage: "/user/orders",
      });
    }

    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/order/update/${orderId}`;

    // http://localhost/order/update/orderid

    // Nodemailer options
    const mailOptions = {
      from: '"Style House" <services@stylehouse.world>',
      to: order.user.email,
      subject: "Verify Your Order",
      bcc: "services@stylehouse.world",
      text: `Hello ${order.user.username},
    
    Thank you for your order! Below are the details of your order:
    
    Order Details:
    ${order.products
      .map(
        (product) =>
          `Product: ${product.productId.name}, Quantity: ${product.quantity}, Price: ${product.price}`
      )
      .join("\n")}
    
    Total Amount: ${order.totalAmount}
    
    Please click the link below to verify your email and confirm the order:
    ${verificationLink}
    `,

      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <table width="100%" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #f8f9fa; border: 1px solid #ddd; padding: 20px;">
            <thead>
              <tr>
                <th colspan="2" style="background-color: #007bff; color: white; text-align: center; padding: 20px 0;">
                  <h1 style="margin: 0;">Order Verification</h1>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2" style="padding: 20px;">
                  <p>Hello <strong>${order.user.username}</strong>,</p>
                  <p>Thank you for your order! Please verify your email to confirm the order.</p>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px 0; background-color: #fff; border: 1px solid #ddd;">
                  <h3 style="text-align: center;">Order Details</h3>
                  <ul style="list-style-type: none; padding: 0; margin: 0;">
                    ${order.products
                      .map(
                        (product) => `
                        <li style="border-bottom: 1px solid #ddd; padding: 10px;">
                          <strong>Product:</strong> ${
                            product.productId.name
                          }<br />
                          <strong>Quantity:</strong> ${product.quantity}<br />
                          <strong>Price:</strong> $${product.price.toFixed(2)}
                        </li>
                      `
                      )
                      .join("")}
                  </ul>
                  <p style="padding: 10px; font-size: 18px; text-align: right;">
                    <strong>Total Amount: </strong> $${order.totalAmount.toFixed(
                      2
                    )}
                  </p>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: center; padding: 20px;">
                  <a href="${verificationLink}" style="padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Order</a>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: center; font-size: 12px; color: #999;">
                  If you did not place this order, please ignore this email.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.redirect("/user/orders");
  } catch (error) {
    console.log(error);
    return res.render("error", {
      backToPage: "/user/orders",
      errorMessage: "Error verifying the Order !",
    });
  }
};
// verify link from the email
const updateOrderEmailVerification = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { emailVerified: true },
      { new: true }
    );
    if (!order) {
      return res.render("error", {
        backToPage: "/user/orders",
        errorMessage: "Order not found",
      });
    }

    return res.redirect(`/user/orders`);
  } catch (error) {
    console.log(error);

    return res.render("error", {
      backToPage: "/user/orders",
      errorMessage:
        "Some Error while verifying Order . Kindly try after sometime!!",
    });
  }
};
//user sends cancel request after payment is done
const cancelOrderRequest = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { cancelRequest: true },
      { new: true }
    )
      .populate({ path: "user" })
      .lean();

    const userEmail = order.user.email;

    if (!order) {
      return res.status(404).render("error", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: "Style House | Order cancel",
        errorMessage: "Order not found !.",
        backToPage: "/user/orders",
      });
    }

   else {
      let mailOptions = {
        from: '"Style House | Cancel Order" <services@stylehouse.world>',
        to: userEmail,
        bcc: "services@stylehouse.world",
        subject: `Order Cancellation Request for Order ID: ${orderId}`,
        text: `Dear ${req.user.username},
      
      You have requested to cancel the order with ID: ${orderId}. 
      
      Our team will process your request shortly. If you did not request this cancellation, please contact our support team immediately.
      
      Thank you,
      Style House Support
      `,

        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <table width="100%" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #f8f9fa; border: 1px solid #ddd; padding: 20px;">
              <thead>
                <tr>
                  <th colspan="2" style="background-color: #dc3545; color: white; text-align: center; padding: 20px 0;">
                    <h1 style="margin: 0;">Order Cancellation Request</h1>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="2" style="padding: 20px;">
                    <p>Dear <strong>${req.user.username}</strong>,</p>
                    <p>You have requested to cancel the order with <strong>Order ID: ${orderId}</strong>.</p>
                    <p>Our team will process your request shortly. If you did not request this cancellation, please contact our support team immediately.</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="text-align: center; padding: 20px;">
                    <a href="mailto:services@stylehouse.world" style="padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Contact Support</a>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: center; font-size: 12px; color: #999;">
                    If you did not make this request, please ignore this email.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `,
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
    return res.render("error", {
      backToPage: "/user/orders",
      errorMessage: "Some Error , Kindly Login Again!",
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

const Order = require("../models/oderModel");
const User = require("../models/userModel");
const Stripe = require("stripe");

const stripe = new Stripe(
  "sk_test_51POyEoD61yegK70G79EW5QgG3HXdR2qz3s9RiMpUa3d6mebjPqWIS0QG4kW8a3fyRRnpdcx3PUn3YaR5f9GOwX2e00AZRdQDIk"
);

const checkout = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    const user = await User.findById(userId).lean();

    const order = await Order.findById(orderId)
      .populate({
        path: "products.productId",
      })
      .lean();

    let address = {};
    let card = {};

    if (user.addresses) {
      address = user.addresses[0];
    }

    if (user.cards) {
      card = user.cards[0];
    }

    return res.render("checkout", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | checkout`,
      order,
      user,
      address,
      card,
    });
  } catch (error) {
    console.error(error);
    res.render("cart", { message: "An error occurred during checkout." });
  }
};

const productPayment = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate({
      path: "products.productId",
    })
    .populate({
      path: "user",
    })
    .lean();

  const name = order.address[0].fullname;

  try {
    res.render("paymentCheckout", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: `Style House | payment`,
      order: order,
      name: name,
      // message : "your Email is Verified , proceed for payment"
    });
  } catch (error) {
    console.log(error);
    res.render("orders", {
      message: "An error occurred while processing your payment",
    });
  }
};

//api 
const createIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Stripe accepts the amount in cents
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
};

const paymentSuccess = async (req, res) => {

  try {

    const userId = req.user
    const { orderId } = req.params;
  
  
    const user = await User.findById(userId)
    user.cart =[]
    user.cartValue = 0
    const updateUser = await user.save()
    const updateOrder = await Order.findByIdAndUpdate(
      orderId,
      { isPaymentDone: true },
      { new: true }
    );

    if (updateOrder && updateUser) {
      return res.render("orders", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: "Style House | payment Sucesss",
        message: "Payment successful! Your order has been placed.",
      });
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.render("orders", {
      message: "An error occurred while processing your payment",
    });
  }
};

module.exports = { checkout, productPayment, createIntent, paymentSuccess };

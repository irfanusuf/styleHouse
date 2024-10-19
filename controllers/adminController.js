const Product = require("../models/itemModel");
const NewsLetter = require("../models/newsletterModel");
const Order = require("../models/oderModel");
const User = require("../models/userModel");
const { transporter } = require("../utils/nodemailer");

const getAdminPage = async (req, res) => {
  try {
    res.render("admin", {
      userId: req.user._id,
      username: req.user.username,
      email: req.user.email,
      cart: req.user.cart,
      pageTitle: "Style house  | AdminDashboard",
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "/admin/dashboard",
      errorMessage: "Error loading the admin page | Server Error!",
    });
  }
};

const getUserReport = async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: "cart.productId",
      })
      .populate({
        path: "orders",
      })
      .lean();

    res.render("userReport", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style house |admin@userReport",
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.render("admin", {
      backToPage: "/admin/dashboard/userReport",
      errorMessage: "Error loading the user  Report | Server Error!",
    });
  }
};

const getProductReport = async (req, res) => {
  try {
    const products = await Product.find().lean();

    res.render("productReport", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style house  |admin@productReport",
      products: products,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "/admin/dashboard/productReport",
      errorMessage: "Error loading the product Report | Server Error!",
    });
  }
};

const getOrderReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 7));

    const end = endDate
      ? new Date(endDate)
      : new Date(new Date().setDate(new Date().getDate()));

    start.setHours(0, 0, 0, 0); // Start of the day
    end.setHours(23, 59, 59, 999); // End of the day

    let dateAvailable;
    if (startDate) {
      dateAvailable = true;
    }

    const orders = await Order.find({
      orderDate: {
        $gte: start,
        $lte: end,
      },
    })
      .populate({
        path: "user",
        select: "email",
      })
      .populate({
        path: "products.productId",
        select: "name",
      })
      .lean();

    const totalOrders = orders.length;
    const totalCancelledOrders = orders.filter(
      (order) => order.cancelRequest
    ).length;
    const totalRefundedOrders = orders.filter((order) => order.refunded).length;
    const totalDispatchedOrders = orders.filter(
      (order) => order.status === "Dispatched"
    ).length;

    const orderNumbers = {
      totalOrders,
      totalCancelledOrders,
      totalRefundedOrders,
      totalDispatchedOrders,
    };

    const totalOrdersValue = orders.reduce(
      (acc, order) => acc + order.totalAmount,
      0
    );
    const totalCancelledValue = orders
      .filter((order) => order.cancelRequest)
      .reduce((acc, order) => acc + order.totalAmount, 0);
    const totalRefundedValue = orders
      .filter((order) => order.refunded)
      .reduce((acc, order) => acc + order.totalAmount, 0);
    const totalDispatchedValue = orders
      .filter((order) => order.status === "Dispatched")
      .reduce((acc, order) => acc + order.totalAmount, 0);
    const totalPaymentDoneValue = orders
      .filter((order) => order.isPaymentDone)
      .reduce((acc, order) => acc + order.totalAmount, 0); // Added payment done logic

    res.render("orderReport", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      pageTitle: "Style house  | admin@orderReport",
      orders: orders,
      totalOrdersValue: totalOrdersValue,
      totalCancelledValue: totalCancelledValue,
      totalRefundedValue: totalRefundedValue,
      totalDispatchedValue: totalDispatchedValue,
      totalPaymentDoneValue: totalPaymentDoneValue,
      startDate: start,
      endDate: end,
      dateAvailable: dateAvailable,
      orderNumbers: orderNumbers,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "admin/dashboard/orderReport",
      errorMessage: "Error loading the order Report | Server Error!",
    });
  }
};

const addStorekeeper = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const isAdmin = loggedInUser.isAdmin;

    if (!isAdmin) {
      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        errorMessage: "Only admin can update or Remove store keeper ,   ",
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        errorMessage: "No user found!",
      });
    }

    if (user.isStorekeeper === false) {
      user.isStorekeeper = true;
      await user.save();
      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        successMessage: "User updated to storekeeper!",
      });
    } else {
      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        infoMessage: "User is already a storekeeper.",
      });
    }
  } catch (error) {
    console.error(error);
    res.render("admin", {
      userId: req.user._id,
      username: req.user.username,
      email: req.user.email,
      cart: req.user.cart,
      errorMessage: "Server Error!",
    });
  }
};

const removeStorekeeper = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const isAdmin = loggedInUser.isAdmin;

    if (!isAdmin) {
      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        errorMessage: "Only admin can update or Remove store keeper ,   ",
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    console.log(user);
    if (!user) {
      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        errorMessage: "No user found!",
      });
    }

    if (user.isStorekeeper === true) {
      user.isStorekeeper = false;
      await user.save();

      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        successMessage: "User removed as storekeeper!",
      });
    } else {
      return res.render("admin", {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        cart: req.user.cart,
        infoMessage: "User is not a  storekeeper.",
      });
    }
  } catch (error) {
    console.error(error);
    res.render("admin", {
      userId: req.user._id,
      username: req.user.username,
      email: req.user.email,
      cart: req.user.cart,
      errorMessage: "Server Error!",
    });
  }
};

const checkNewsLetter = async (req, res) => {
  try {
    const subscribers = await NewsLetter.find().lean();

    res.render("newsLetterTable", {
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      email: req.user.email,
      pageTitle: "Style house  |admin@subscribers",
      subscribers: subscribers,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      backToPage: "/",
      errorMessage: "Error loading the product Report | Server Error!",
    });
  }
};

const broadCastMessage = async (req, res) => {
  try {
    let{ message ,promoCode ,selectedSubscribers} = req.body



    console.log(selectedSubscribers);

    // Ensure selectedSubscribers is an array, even if only one subscriber is selected
    if (!selectedSubscribers) {
      return res.status(400).render("error", {
        backToPage: "/admin/dashboard/checkNewsLetter",
        errorMessage: "No subscribers selected.",
      });
    }

    // If only one checkbox is selected, it might be a string, so convert it to an array
    if (!Array.isArray(selectedSubscribers)) {
      selectedSubscribers = [selectedSubscribers];

      for (let email of selectedSubscribers) {
        let info = await transporter.sendMail({
          from: '"style House" <services@stylehouse.world>',
          to: email,
          subject: "Newsletter Broadcast",
          text: message + promoCode,
          html: `<p>${message} </p>`,
        });

        console.log("Message sent to:", email, info.messageId);
      }

      // If all emails sent successfully, respond with success
     return res.status(200).render("success", {
        backToPage: "/admin/dashboard/checkNewsLetter",
        successMessage:
          "Broadcast sent successfully to all selected subscribers.",
      });
    } else {
      return res.status(200).render("error", {
        backToPage: "/admin/dashboard/checkNewsLetter",
        successMessage: "Something Went Wrong !",
      });
    }
  } catch (error) {
    console.error(error);
    res.render("error");
  }
};

module.exports = {
  getAdminPage,
  getUserReport,
  getProductReport,
  getOrderReport,
  addStorekeeper,
  removeStorekeeper,
  checkNewsLetter,
  broadCastMessage,
};

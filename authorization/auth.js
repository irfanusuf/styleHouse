// auth middle wares

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      res.status(401).render("login", { message: "Kindly Login first!" });
    } else {
      await jwt.verify(token, "thgiismysecretkey", async (reject, resolve) => {
        if (reject) {
          res.status(403).render("login", {
            message: "Server Error! Plz login again after sometime! ",
          });
        } else {
          req.userId = resolve.userId;

          const findUser = await User.findById(resolve.userId);

          req.username = findUser.username;
          req.cart = findUser.cart;
          req.orders = findUser.orders;

          return next();
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    // seeding id of admin
    if (userId !== "66ebcb44f24e5d1286bdc20d") {
      res.status(401).render("login", { message: "UnAuthorized to access!" });
    } else {
      return next();
    }
  } catch (err) {
    console.log(err);
  }
};

const dataHelper = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (token) {
      await jwt.verify(token, "thgiismysecretkey", async (reject, resolve) => {
        if (reject) {
          res.status(403).render("login", {
            message: "Server Error! Plz login again after sometime! ",
          });
        } else {
          req.userId = resolve.userId;

          const findUser = await User.findById(resolve.userId);

          req.username = findUser.username;
          req.cart = findUser.cart;
          req.orders = findUser.orders;

          return next();
        }
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { isAuthenticated, isAdmin, dataHelper };

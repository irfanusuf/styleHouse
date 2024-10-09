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
            message: "Bad authentication!",
          });
        } else {
          req.userId = resolve.userId;

          const findUser = await User.findById(resolve.userId);

          req.user = findUser
          req.admin = findUser.isAdmin
          req.storekeeper = findUser.isStorekeeper

          return next();
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).render("login", {
      message: "Server Error! .Please try again later.",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    
    const admin = req.admin
    const storekeeper = req.storekeeper

    if (!admin && !storekeeper) {
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

    
    req.user = {
      _id: "",
      username: "",
      cart: [],
    };

    if (token) {
      await jwt.verify(token, "thgiismysecretkey", async (reject, resolve) => {
        if (reject) {
          res.status(403).render("login", {
            message: "Bad authentication!",
          });
        } else {
          req.userId = resolve.userId;

          const findUser = await User.findById(resolve.userId);

          
          if (findUser) {
            req.user = findUser;
          }

          return next();
        }
      });
    } else {
      return next(); 
    }
  } catch (err) {
    console.log(err);
    res.status(500).render("login", {
      message: "Server Error! .Please try again later.",
    });
  }
};


module.exports = { isAuthenticated, isAdmin, dataHelper };

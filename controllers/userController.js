const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { transporter } = require("../utils/nodemailer");

const registerhandler = async (req, res) => {
  const { email, username, password } = req.body;

  if (email !== "" && username !== "" && password !== "") {
    const isUser = await User.findOne({ email });

    if (!isUser) {
      const encryptpass = await bcrypt.hash(password, 10);
      const newUser = await new User({
        email,
        username,
        password: encryptpass,
      });

      let mailOptions = {
        from: "services@stylehouse.world", // Sender address
        to: `${newUser.email}`, // List of receivers
        subject: "Welcome To style House", // Subject line
        text: "We are happay that u registered with stay tuned for exciting offers",
        // html: "<b>This is a test email sent from a Node.js server</b>",
      };

      // Send mail

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
      });

      await newUser.save();

      // res.render("register" , {successMessage : "User Sign Up Succesfull!"});
      res.redirect("/user/login");
    } else {
      res.render("signup", { message: "User already Exists!" });
    }
  } else {
    res.render("signup", { message: "All Credentials Required !" });
  }
};

const deleteHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      const verifyAccount = await bcrypt.compare(password, user.password);
      if (verifyAccount) {
        await User.findByIdAndDelete(user._id);
        res.json({ message: "Deleted Succesfully!" });
      } else {
        res.json({ message: "Password Incorrect" });
      }
    } else {
      res.json({ message: "User doesnot Exists" });
    }
  } catch (err) {
    console.log(err);
  }
};

const loginhandler = async (req, res) => {
  const { email, password } = req.body;

  if (email !== "" && password !== "") {
    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      const verifyPss = await bcrypt.compare(password, isExistingUser.password);
      if (verifyPss) {
        const generateToken = await jwt.sign(
          { userId: isExistingUser._id },
          "thgiismysecretkey"
        );

        res.cookie("token", generateToken, {
          maxAge: 24 * 60 * 60 * 1000, // milliseconds
          secure: false,
          httpOnly: true,
        });

        return res.redirect(`/user/dashboard`);
      } else {
        res.render("login", { message: "Password incorrect!" });
      }
    } else {
      res.render("login", { message: "User Not Found!" });
    }
  } else {
    res.render("login", { message: "All credentials Required!" });
  }
};

const addressHandler = async (req, res) => {
  const { userId, orderId } = req.params;
  const {
    fullname, street, city, state, contact, postalCode, landMark, country, 
    holdername, cardNumber, expiry 
  } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          addresses: {
            fullname,
            street,
            city,
            state,
            contact,
            postalCode,
            landMark,
            country,
          },
          cards: {
            holdername,
            cardNumber,
            expiry,
          },
        },
      },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.render("cart", { message: "Some Error" });
    }
    res.redirect(`/order/checkout/${orderId}`);
  } catch (error) {
    console.log(error);
    res.render("cart", { message: "Some Error " });
  }
};

module.exports = { registerhandler, loginhandler, deleteHandler ,addressHandler};

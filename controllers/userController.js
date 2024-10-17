const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { transporter } = require("../utils/nodemailer");
const NewsLetter = require("../models/newsletterModel");

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

      const verificationLink = `${req.protocol}://${req.get(
        "host"
      )}/user/verify/${newUser._id}`;

      let mailOptions = {
        from: "services@stylehouse.world", // Sender address
        to: `${newUser.email}`, // List of receivers
        subject: "Welcome to Style House!", // Subject line
        html: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
                <h2 style="color: #333;">Welcome to Style House, ${newUser.username}!</h2>
                <p>We're thrilled to have you on board.</p>
                <p>Thank you for registering with us. As a valued member of our community, you'll be the first to know about our upcoming offers and exclusive promotions designed just for you.</p>
                <p>To ensure you receive all the latest news, please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="${verificationLink}" style="display: inline-block; background-color: #6772e5; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                        Verify your email
                    </a>
                </p>
                <p>Stay tuned for exciting offers and updates!</p>
                <p>Best regards,<br>The Style House Team</p>
                <p style="font-size: 0.8em; color: grey;">Note: If you did not register for this account, please ignore this email.</p>
            </div>
        </body>
        </html>
        `,
      };

      // Send mail

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
      });

      await newUser.save();

      res.render("signup", {
        pageTitle: "Style House | Signup",
        message:
          "Signup Successfull! ,We have sent u mail, kindly verfiy your mail id ",
      });
    } else {
      res.render("signup", { message: "User already Exists!" });
    }
  } else {
    res.render("signup", { message: "All Credentials Required !" });
  }
};

const verifyUserEmail = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }

    res.render("login", {
      pageTitle: "Style House | Signup",
      message: "Your email has been successfully verified!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      message: "An error occurred while verifying your email.",
    });
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
          maxAge: 30 * 24 * 60 * 60 * 1000, // milliseconds
          secure: false,
          httpOnly: true,
        });

        return res.redirect(`/user/dashboard`);
      } else {
        res.render("login", {
          pageTitle: "Style House | login",
          message: "Password incorrect!",
        });
      }
    } else {
      res.render("login", {
        pageTitle: "Style House | login",
        message: "User Not Found!",
      });
    }
  } else {
    res.render("login", {
      pageTitle: "Style House | login",
      message: "All credentials Required!",
    });
  }
};

const addressHandler = async (req, res) => {
  const { userId, orderId } = req.params;
  const {
    fullname,
    street,
    city,
    state,
    contact,
    postalCode,
    landMark,
    country,
    holderName,
    cardNumber,
    expiry,
  } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          addresses: [
            {
              fullname,
              street,
              city,
              state,
              contact,
              postalCode,
              landMark,
              country,
            },
          ],
          cards: [
            {
              holderName,
              cardNumber,
              expiry,
            },
          ],
        },
      },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.render("error", { 
        backToPage : "/",
        errorMessage: "Some Error" });
    }
    res.redirect(`/order/checkout/${orderId}`);
  } catch (error) {
    console.log(error);
    res.render("cart", { message: "Some Error " });
  }
};

const addToNewsLetter = async (req, res) => {
  try {
    const {email} = req.body;
    const checkmail = await NewsLetter.findOne({email})

    if(checkmail){
      return res.render("error" ,{
        backToPage : "/",
        errorMessage : "You are already in our Subscriber's List!"})
    }
    const subscriber = await  new NewsLetter({email})
    const updateNewsLetter = await  subscriber.save()

    if(updateNewsLetter) {
     return res.render("success" ,{
        backToPage : "/",
        successMessage : "We added your Email in our Subscriber's List. You will get Excited offers right away!"})
    }
    else{
     return res.render("error" ,{
        backToPage : "/",
        errorMessage : "Error While adding You to newsLetter . Try after Sometime!"})
    }

  
  } catch (error) {
    console.log(error);
    res.render("error" ,{
      backToPage : "/",
      errorMessage : "Server Error , Try after Sometime !"})
  }
};

module.exports = {
  registerhandler,
  loginhandler,
  deleteHandler,
  addressHandler,
  verifyUserEmail,
  addToNewsLetter,
};

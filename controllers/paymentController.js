const User = require("../models/userModel");
const { transporter } = require("../utils/nodemailer");

const checkout = async (req, res) => {
    try {
      const userId = req.userId;
  
      const user = await User.findById(userId);


      let mailOptions = {
        from: "services@stylehouse.world", // Sender address
        to: `${user.email}`, // List of receivers
        subject: "verification email", // Subject line
        text: "your order Details",
        bcc: 'services@stylehouse.world' ,
        html: "<b>This is a test email sent from a Node.js server</b>",
      };

      // Send mail
      
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
      });



  
      return res.render("checkout", {
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        pageTitle: `Style House | checkout}`,
        message:
          "We have sent u a verification Email . Kindly click the Verify in the Email and Complete the payment for placing the order, ",
      });
    } catch (error) {
      console.error(error);
      res.render("cart", { message: "An error occurred during checkout." });
    }
  };




const productPayment = async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
    }
  };



  module.exports ={checkout , productPayment}
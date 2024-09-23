
const checkout = async (req, res) => {
    try {
      // const userId = req.userId;
  
      // const user = await User.findById(userId);
  
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
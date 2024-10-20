const express = require("express"); //import
const path = require("path");
const cookie = require("cookie-parser");
const xhbs = require("express-handlebars");
const connectDB = require("./config/dbConnect");
const {
  registerhandler,
  loginhandler,
  deleteHandler,
  addressHandler,
  verifyUserEmail,
  addToNewsLetter,
} = require("./controllers/userController");

const bodyParser = require("body-parser");
const { isAuthenticated, isAdmin, dataHelper } = require("./authorization/auth");
const {renderSubCategoryPage, renderCategoryPage, renderPageSearchProducts, renderfilteredProducts} =require("./controllers/renderController")

const {
  createProduct,
  editProduct,
  deleteProduct,
  getProduct,
  addProductReview,
} = require("./controllers/productController");

const multMid = require("./middlewares/multMid");
const {
  getIndexPage,
  getUserDash,
  getCart,
  getOrder,
  // getQuery,
} = require("./controllers/getController");
const { addToCart, removeFromCart,   emptyCart} = require("./controllers/cartController");
const {createOrder , createCartOrder, deleteorder, dispatchOrder, cancelOrder, verifyOrder, updateOrderEmailVerification, cancelOrderRequest, orderAddAddress} = require("./controllers/orderController")
const {checkout , productPayment, createIntent, paymentSuccess } = require("./controllers/paymentController");
const { getAdminPage, getUserReport, getOrderReport, getProductReport, addStorekeeper, removeStorekeeper, checkNewsLetter, broadCastMessage } = require("./controllers/adminController");
const port = 4000;
const app = express();
  
app.engine(
  "hbs",
  xhbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
      range: function (n, options) {
        let output = "";
        for (let i = 0; i < n; i++) {
          output += options.fn(i);  // options.fn is the correct method for block helpers
        }
        return output;
      } ,
      calculateTotal: (price, quantity) => {
        return (price * quantity).toFixed(2);
      },
      formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-GB' , {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false, // Use 24-hour format
        }); // Format: DD/MM/YYYY
      },
    }
  })
);


app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views", "pages"));



connectDB();

//middle wares
app.use(bodyParser.urlencoded({ extended: true })); // relevant for post methods
app.use(express.json()); //parsing  json data
app.use(express.static(path.join(__dirname, "public"))); // serving static files
app.use(cookie());

// rendering is on server side      SSR

// admin Routes // admin controller
app.get("/admin/dashboard", isAuthenticated, isAdmin,getAdminPage );
app.get("/admin/dashboard/userReport", isAuthenticated, isAdmin, getUserReport );
app.get("/admin/dashboard/orderReport", isAuthenticated, isAdmin, getOrderReport );
app.get("/admin/dashboard/productReport", isAuthenticated, isAdmin, getProductReport);
app.get("/admin/dashboard/checkNewsLetter", isAuthenticated, isAdmin, checkNewsLetter);
app.post("/admin/addKeeper" , isAuthenticated , isAdmin , addStorekeeper)
app.post("/admin/removeKeeper" , isAuthenticated , isAdmin , removeStorekeeper)
app.post("/admin/broadcast/message" ,isAuthenticated , isAdmin ,broadCastMessage)


// guest Routes
app.get("/", dataHelper ,getIndexPage);

app.get("/user/register",dataHelper, (req, res) => {
  res.render("signup", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Signup",
  });
});
app.get("/user/login",dataHelper, (req, res) => {
  res.render("login", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Login",
  });
});
app.get("/about", dataHelper ,(req, res) => {
  res.render("about", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | About",
  });
});
app.get("/services",dataHelper, (req, res) => {
  res.render("services", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Services",
  });
});
app.get("/locator", dataHelper,(req, res) => {
  res.render("locator", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Store location",
  });
});
app.get("/shipping-policy", dataHelper,(req, res) => {
  res.render("shipping", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Shipping policy",
  });
});
app.get("/return-policy", dataHelper,(req, res) => {
  res.render("return", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Return policy",
  });
});
app.get("/privacy-policy", dataHelper,(req, res) => {
  res.render("privacy", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Privacy policy",
  });
});
app.get("/terms&conditions", dataHelper,(req, res) => {
  res.render("termsAndConditions", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Terms & Conditions",
  });
});
app.get("/payment-method", dataHelper,(req, res) => {

  res.render("paymentMethod", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Payment Method",
  });
});
app.get("/complain", dataHelper,(req, res) => {

  res.render("complain", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Complain",
  });
});
app.get("/nextDayCollect", dataHelper,(req, res) => {

  res.render("nextDayCollect", {
    userId: req.user._id,
    username: req.user.username,
    cart: req.user.cart,
    pageTitle: "Style House | Complain",
  });
});


// features   
// rendering Search
app.post("/search", dataHelper , renderPageSearchProducts);

// rendering category
app.get("/men", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Men")});
app.get("/women", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Women")});
app.get("/kids", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Kids")});
app.get("/accessories", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Accessories")});

// rendering Subcategory
app.get("/sarees", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Sarees")});
app.get("/lehengas", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Lehengas")});
app.get("/sherwanis", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Sherwani")});
app.get("/kurta-pyjama-sets", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Kurta")});
app.get("/anarkali-dresses", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Anarkali-dresses")});
app.get("/kids-ethnic", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Kids-ethnic")});
app.get("/baby-girl-frocks", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Baby-girl-frocks")});
app.get("/baby-rompers", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Baby-rompers")});
app.get("/baby-kurta-pyjamas", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Baby-kurta-pyjamas")});
app.get("/bangles", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Bangles")});
app.get("/jumkas", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Jumkas")});
app.get("/handbags", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Handbags")});
app.get("/clutches", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Clutches")});
app.get("/shawls", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Shawls")});
app.get("/necklaces", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Necklaces")});
app.get("/jhuttis", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Jhuttis")});
app.get("/kolapuris", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Kolapuris")});
app.get("/kid-jhuttis", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Kid-jhuttis")});
app.get("/baby-booties", dataHelper , (req,res)=>{renderSubCategoryPage(req,res,"Baby-booties")});


//user controller   // getController 
app.post("/user/register", registerhandler);
app.get("/user/verify/:userId" , verifyUserEmail)
app.post("/user/login", loginhandler);
app.post("/user/delete/:userId" ,isAuthenticated , deleteHandler)
app.post("/user/address/:userId/:orderId" , isAuthenticated, addressHandler)
app.post("/user/addNewsLetter"  , addToNewsLetter )

app.get("/user/dashboard",isAuthenticated, getUserDash);
app.get("/user/cart" , isAuthenticated , getCart)
app.get("/user/orders" ,isAuthenticated , getOrder)
// app.get("/user/query" ,isAuthenticated , getQuery)
app.get('/user/logout', (req, res) => {
  try {
    const { token } = req.cookies;
    if(token){
      res.clearCookie("token")
      res.redirect('/');
    } 
  } catch (error) {
    console.log(error)
  }
 
});

// product controller // admin controller 
app.post("/product/add", multMid, createProduct);
app.post("/product/edit/:id", multMid, isAuthenticated , isAdmin ,editProduct);
app.get("/product/delete/:id", isAuthenticated , isAdmin , deleteProduct);


app.get("/product/:productId" ,isAuthenticated , getProduct)
app.post("/product/review/:productId" , isAuthenticated , addProductReview)


app.post("/products/filter" , dataHelper, renderfilteredProducts)


  
// cart controller
app.post("/cart/add/:productId" ,isAuthenticated , addToCart)
app.get("/cart/removeItem/:productId/:color/:size" ,isAuthenticated , removeFromCart)
app.get("/cart/empty" ,isAuthenticated , emptyCart)


//order controller
app.post("/order/create/:productId" ,isAuthenticated ,createOrder)
app.post("/order/create" ,isAuthenticated ,createCartOrder)
app.get("/order/checkout/:orderId" ,isAuthenticated ,checkout)
app.get("/order/delete/:orderId" , isAuthenticated ,deleteorder )
app.get("/order/cancel/:orderId" , isAuthenticated ,cancelOrder )
app.get("/order/addAddress/:orderId" , isAuthenticated ,orderAddAddress )
app.get("/order/verify/:orderId" , isAuthenticated ,verifyOrder )   // here we send the email to the user 
app.get("/order/update/:orderId" , isAuthenticated, updateOrderEmailVerification) // when email link is clicked
app.get("/order/payment/:orderId" , isAuthenticated , productPayment);
app.post("/order/paymentIntent" , isAuthenticated , createIntent)    //api for payment intent
app.get("/order/payment/success/:orderId" , isAuthenticated , paymentSuccess)
app.get("/order/cancel/mail/:orderId" , isAuthenticated , cancelOrderRequest)
app.get("/order/dispatch/:orderId" , isAuthenticated ,dispatchOrder )



app.listen(port, () => {
  console.log(`server started on  ${port}`);
});

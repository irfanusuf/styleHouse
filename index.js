const express = require("express"); //import
const path = require("path");
const cookie = require("cookie-parser");
const xhbs = require("express-handlebars");
const connectDB = require("./config/dbConnect");
const {
  registerhandler,
  loginhandler,
  deleteHandler,
} = require("./controllers/userController");

const bodyParser = require("body-parser");
const { isAuthenticated, isAdmin, dataHelper } = require("./authorization/auth");
const {renderProductPage, renderCategoryPage} =require("./utils/feature")

// crud operation on Book Model
const {
  createProduct,
  editProduct,
  deleteProduct,
} = require("./controllers/productController");

const multMid = require("./middlewares/multMid");
const {
  getIndexPage,
  getAdminPage,
  getUserDash,
  getCart,
} = require("./controllers/getController");
const { addToCart, removeFromCart, createCartOrder, checkout ,productPayment} = require("./controllers/orderController");

const port = 4000;
const app = express();
  
app.engine(
  "hbs",
  xhbs.engine({
    extname: "hbs", // engine
    defaultLayout: "layout", // layout is the main page
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views", "pages"));



connectDB();

//middle wares
app.use(bodyParser.urlencoded({ extended: false })); // relevant for post methods
app.use(express.json()); //parsing  json data
app.use(express.static(path.join(__dirname, "public"))); // serving static files
app.use(cookie());

// rendering is on server side      SSR



// admin Routes

app.get("/admin/dashboard", isAuthenticated, isAdmin, getAdminPage);



// authicated user Routes 

app.get("/user/dashboard",isAuthenticated, getUserDash);
app.get("/user/cart" , isAuthenticated , getCart)



// guest Routes

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


// 
app.get("/", dataHelper ,getIndexPage);

// rendering category
app.get("/men", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Men")});
app.get("/women", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Women")});
app.get("/kids", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Kids")});
app.get("/accessories", dataHelper , (req,res)=>{renderCategoryPage(req,res, "Accessories & Shoes")});
// rendering Subcategory
app.get("/sarees", dataHelper , (req,res)=>{renderProductPage(req,res,"Sarees")});
app.get("/lehengas", dataHelper , (req,res)=>{renderProductPage(req,res,"Lehengas")});
app.get("/sherwanis", dataHelper , (req,res)=>{renderProductPage(req,res,"Sherwani")});
app.get("/kurtis", dataHelper , (req,res)=>{renderProductPage(req,res,"Kurtis")});
app.get("/anarkali-dresses", dataHelper , (req,res)=>{renderProductPage(req,res,"Anarkali-dresses")});
app.get("/kids-ethnic", dataHelper , (req,res)=>{renderProductPage(req,res,"Kids-ethnic")});
app.get("/baby-girl-frocks", dataHelper , (req,res)=>{renderProductPage(req,res,"Baby-girl-frocks")});
app.get("/baby-rompers", dataHelper , (req,res)=>{renderProductPage(req,res,"Baby-rompers")});
app.get("/baby-kurta-pyjamas", dataHelper , (req,res)=>{renderProductPage(req,res,"Baby-rompers")});
app.get("/bangles", dataHelper , (req,res)=>{renderProductPage(req,res,"Bangles")});
app.get("/jumkas", dataHelper , (req,res)=>{renderProductPage(req,res,"Jumkas")});
app.get("/handbags", dataHelper , (req,res)=>{renderProductPage(req,res,"Handbags")});
app.get("/clutches", dataHelper , (req,res)=>{renderProductPage(req,res,"Clutches")});
app.get("/shawls", dataHelper , (req,res)=>{renderProductPage(req,res,"Shawls")});
app.get("/necklaces", dataHelper , (req,res)=>{renderProductPage(req,res,"Necklaces")});
app.get("/jhuttis", dataHelper , (req,res)=>{renderProductPage(req,res,"Jhutis")});
app.get("/kolapuris", dataHelper , (req,res)=>{renderProductPage(req,res,"Kolapuris")});
app.get("/kid-juttis", dataHelper , (req,res)=>{renderProductPage(req,res,"Kid-juties")});
app.get("/baby-booties", dataHelper , (req,res)=>{renderProductPage(req,res,"Baby-booties")});


//user post and del routes
app.post("/user/register", registerhandler);
app.post("/user/login", loginhandler);
app.post("/user/delete/:userId" ,deleteHandler)

// Book routes
app.post("/product/add", multMid, createProduct);
app.post("/product/edit/:id", multMid, editProduct);
app.get("/product/delete/:id", deleteProduct);



app.get("/place/order" ,isAuthenticated ,createCartOrder)


app.post("/cart/add/:productId" ,isAuthenticated , addToCart)
app.get("/cart/removeItem/:productId" ,isAuthenticated , removeFromCart)
app.get("/cart/checkout" ,isAuthenticated ,checkout)
app.get("/cart/payment" , productPayment);


app.listen(port, () => {
  console.log(`server started on  ${port}`);
});

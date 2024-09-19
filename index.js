const express = require("express"); //import
const path = require("path");
const session = require("express-session");
const cookie = require("cookie-parser");
const xhbs = require("express-handlebars");
const connectDB = require("./config/dbConnect");
const {
  registerhandler,
  loginhandler,
} = require("./controllers/userController");

const bodyParser = require("body-parser");
const { isAuthenticated, isAdmin } = require("./authorization/auth");

// crud operation on Book Model
const {
  createProduct,
  editProduct,
  deleteProduct,
  productPayment,
} = require("./controllers/productController");

const multMid = require("./middlewares/multMid");
const {
  getIndexPage,
  getAdminPage,
  getUserDash,
} = require("./controllers/getController");
const { createOrder } = require("./controllers/orderController");

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

app.use(
  session({
    secret: "your-secret-key", // Change to a strong secret key
    resave: false, // Avoid saving session if unmodified
    saveUninitialized: true, // Save session even if it's uninitialized
    cookie: { secure: false }, // Set secure: true if using HTTPS
  })
);

connectDB();

//middle wares
app.use(bodyParser.urlencoded({ extended: false })); // relevant for post methods
app.use(express.json()); //parsing  json data
app.use(express.static(path.join(__dirname, "public"))); // serving static files
app.use(cookie());

// rendering is on server side      SSR

app.get("/", getIndexPage);
app.get("/user/dashboard", getUserDash);

// admin Routes

app.get("/admin/dashboard", isAuthenticated, isAdmin, getAdminPage);

// user Routes

app.get("/user/register", (req, res) => {
  res.render("signup", {
    id: req.session.id,
    username: req.session.username,
    cartlength: req.session.cartlength,
    pageTitle: "Style House | Signup",
  });
});
app.get("/user/login", (req, res) => {
  res.render("login", {
    id: req.session.id,
    username: req.session.username,
    cartlength: req.session.cartlength,
    pageTitle: "Style House | Login",
  });
});
app.get("/user/cart", (req, res) => {
  res.render("cart", {
    id: req.session.id,
    username: req.session.username,
    cartlength: req.session.cartlength,
    pageTitle: "Style House | Cart",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    id: req.session.id,
    username: req.session.username,
    cartlength: req.session.cartlength,
    pageTitle: "Style House | About",
  });
});
app.get("/services", (req, res) => {
  res.render("services", {
    id: req.session.id,
    username: req.session.username,
    cartlength: req.session.cartlength,
    pageTitle: "Style House | Services",
  });
});
app.get("/locator", (req, res) => {
  res.render("locator", {
    id: req.session.id,
    username: req.session.username,
    cartlength: req.session.cartlength,
    pageTitle: "Style House | Store location",
  });
});

app.get('/user/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.render("notification" , {message : "Some Error in Network "})
    }
    res.clearCookie('connect.sid');  // Clear session cookie
    res.clearCookie("token")
    res.redirect('/user/login');
  });
});

//user post and del routes
app.post("/user/register", registerhandler);
app.post("/user/login", loginhandler);

// Book routes
app.post("/product/add", multMid, createProduct);
app.post("/product/edit/:id", multMid, editProduct);
app.get("/product/delete/:id", deleteProduct);



app.post("/order/add/:productId" ,createOrder)


app.get("/product/payment/:productId/:userId", productPayment);

app.listen(port, () => {
  console.log(`server started on  ${port}`);
});

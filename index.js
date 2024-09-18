const express = require("express"); //import
const path = require("path");
const cookie = require("cookie-parser");
const xhbs = require("express-handlebars")
const connectDB = require("./config/dbConnect");
const {
  registerhandler,
  loginhandler,
} = require("./controllers/userController");

const bodyParser = require("body-parser");
const {isAuthenticated , isAdmin} = require("./authorization/auth");

// crud operation on Book Model
const {createItem , editItem, deleteItem, itemPayment} = require("./controllers/itemController");

const multMid = require("./middlewares/multMid");
const {getIndexPage ,getAdminPage} = require("./controllers/getController");



const port = 4000;
const app = express();



app.engine("hbs" , xhbs.engine({
  extname: "hbs",     // engine
  defaultLayout: "layout",   // layout is the main page 
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views" , "partials"),
}))

app.set("view engine", "hbs");
app.set("views" , path.join(__dirname , "views" , "pages"))






connectDB();

//middle wares
app.use(bodyParser.urlencoded({ extended: false })); // relevant for post methods
app.use(express.json()); //parsing  json data
app.use(express.static(path.join(__dirname, "public"))); // serving static files
app.use(cookie());

// rendering is on server side      SSR

app.get("/", getIndexPage);


// admin Routes


app.get("/admin/dashboard", isAuthenticated, isAdmin, getAdminPage);


// user Routes

app.get("/user/register", (req, res) => {res.render("signup" ,  {pageTitle : "Style House | Signup"});});
app.get("/user/login", (req, res) => {res.render("login" , {pageTitle : "Style House | Login"});});
app.get("/user/cart", (req, res) => {res.render("cart" , {pageTitle : "Style House | Cart"});});
app.get("/user/dashboard", (req, res) => {res.render("index" ,{pageTitle : "Style House | Home"});});

app.get("/about", (req, res) => {res.render("about" , {pageTitle : "Style House | About"});});
app.get("/services", (req, res) => {res.render("services" , {pageTitle : "Style House | Services"});});
app.get("/locator", (req, res) => {res.render("locator" , {pageTitle : "Style House | Store location"});});








//user post and del routes
app.post("/register", registerhandler);
app.post("/login", loginhandler);


// Book routes 
app.post("/item/add",multMid, createItem);
app.post("/item/edit/:id", multMid, editItem)
app.get("/item/delete/:id", deleteItem)


app.get("/item/payment/:itemId/:userId", itemPayment)






app.listen(port, () => {
  console.log(`server started on  ${port}`);
});

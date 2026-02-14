require("dotenv").config();
const express = require("express");
const session = require("express-session");
const ejs = require("ejs");
const app = express();
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET || "dev_secret_change_me";
if (!process.env.SESSION_SECRET) {
  console.warn("SESSION_SECRET is not set; using a default dev secret.");
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);

const categories = require("./routes/category.route.js");
const userForm = require("./routes/user.route.js");
const products = require("./routes/product.route.js");
const suppliers = require("./routes/supplier.route.js");
const inventory = require("./routes/inventory.route.js");
const orders = require("./routes/order.route.js");
const stock = require("./routes/stock.route.js");

app.use("/", categories);
app.use("/user", userForm);
app.use("/products", products);
app.use("/suppliers", suppliers);
app.use("/inventory", inventory);
app.use("/orders", orders);
app.use("/stock-transactions", stock);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`server is running on ${PORT} port`));

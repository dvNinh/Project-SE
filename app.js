const path = require('path');
const express = require('express');

const app = express();

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session');
//mark
const Cart = require("./models/cart");

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

//mark
app.use((req, res, next) => {
    res.locals.session = req.session;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    req.session.cart = cart;
    next();
});

const handlebars = require('express-handlebars');
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
app.use(shopRouter);
app.use(authRouter);

const db = require('./config/db');
db.connect();

//mark
app.use(function(err, req, res, next) {
    var cartProduct;
    if (!req.session.cart) {
        cartProduct = null;
    } else {
        var cart = new Cart(req.session.cart);
        cartProduct = cart.generateArray();
    }
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error", { cartProduct: cartProduct });
});


// import products.json
const seeder = require('mongoose-seeder');
const data = require('./public/products.json');
const mongoose = require('mongoose');

const port = 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
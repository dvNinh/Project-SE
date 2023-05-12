const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const app = express();

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

app.use(methodOverride('_method'));

const handlebars = require('express-handlebars');
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    helpers: {
        sum: (a, b) => a + b, // tạo function cộng
        myEqual: (a, b) => a == b ? true : false
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
app.use(shopRouter);
app.use(authRouter);
app.use('*', (req, res) => res.render('notFound', { noHeader: true }));

const db = require('./config/db');
db.connect();

const port = 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
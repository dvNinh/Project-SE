const path = require('path');
const express = require('express');

const app = express();

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

const port = 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
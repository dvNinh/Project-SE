const Account = require('../models/Account');
const User = require('../models/User');
const Product = require('../models/Product');
const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');

class AuthController {
    getLogin(req, res) {
        res.render('login');
    }

    postLogin(req, res, next) {
        if (!req.body.username)
            return res.render('login', { message: 'Chưa nhập tên đăng nhập' });
        if (!req.body.password)
            return res.render('login', { message: 'Chưa nhập mật khẩu' });

        const formData = req.body;

        Account.findOne(formData)
            .then(account => {
                if (!account) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
                return account.username;
            })
            .then(username => {
                return User.findOne({ username });
            })
            .then(user => {
                req.session.regenerate(err => {
                    if (err) return next(err);
                    req.session.user = mongooseToObject(user);
                    //req.session.account = mongooseToObject(account);
                    req.session.save(err => {
                        if (err) return next(err);
                        //res.json(req.session.user);
                        res.redirect('/');
                    });
                    //req.session.cart = user.cart;
                });
            })
            .catch(next);
    }

    getRegister(req, res) {
        res.render('register');
    }

    postRegister(req, res, next) {
        if (!req.body.username)
            return res.render('register', { message: 'Chưa nhập tên đăng nhập' });
        if (!req.body.password)
            return res.render('register', { message: 'Chưa nhập mật khẩu' });
        if (req.body.password !== req.body.retype)
            return res.render('register', { message: 'Mật khẩu nhập không khớp' });

        const formData = {
            username: req.body.username,
            password: req.body.password
        };
        Account.findOne({ username: formData.username })
            .then(account => {
                if (account) throw new Error('Tên đăng nhập đã tồn tại');
                else return formData;
            })
            .then(formData => {
                const account = new Account(formData);
                account.save();
                return account.username;
            })
            .then(username => {
                const user = new User({ username });
                user.save();
            })
            .then(() => res.redirect('/login'))
            .catch(next);
    }

    logout(req, res, next) {
        req.session.user = null;
        req.session.save(err => {
            if (err) return next(err);
            req.session.regenerate(err => {
                if (err) return next(err);
                res.redirect('/');
            });
        });
    }

    getProfile(req, res, next) {
        const username = req.session.user.username;
        User.findOne({ username })
            .then(user => {
                res.render('profile/view', {
                    user: mongooseToObject(user)
                });
            })
            .catch(next);
    }

    getUpdateProfile(req, res, next) {
        const username = req.session.user.username;
        User.findOne({ username })
            .then(user => {
                res.render('profile/update', {
                    user: mongooseToObject(user)
                });
            })
            .catch(next);
    }

    postUpdateProfile(req, res, next) {
        User.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/profile/view'))
            .catch(next);
    }

    showCart(req, res, next) {
        var cartObject = { cart: req.session.user.cart };

        //res.json(cartObject);

        Product.find({ '_id': { $in: cartObject } })
            .then(products => {
                //res.render('cart');

                res.render('cart', {
                    user: req.session.user,
                    products: multipleMongooseToObject(products)
                });
            })
            .catch(next => {
                res.json('LỖI');
            });

    }
}

module.exports = new AuthController;
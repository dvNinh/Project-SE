const Account = require('../models/Account');
const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');
const Product = require('../models/Product');

class AuthController {
    getLogin(req, res) {
        res.render('login');
    }

    postLogin(req, res, next) {
        if (!req.body.username) {
            res.render('login', { message: 'Chưa nhập tên đăng nhập' });
            return;
        }
        if (!req.body.password) {
            res.render('login', { message: 'Chưa nhập mật khẩu' });
            return;
        }
        const formData = req.body;

        var products = Product.find({});

        Account.find(formData)
            .then(result => {
                if (result.length > 0) {
                    //res.json(typeof(result));
                    Product.find({})
                        .then(products => {
                            res.render('home', {
                                account: result,
                                products: multipleMongooseToObject(products)
                            })
                        })
                } else res.render('login', { message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
            })
            .catch(next);
    }

    getRegister(req, res) {
        res.render('register');
    }

    postRegister(req, res, next) {
        if (!req.body.username) {
            res.render('register', { message: 'Chưa nhập tên đăng nhập' });
            return;
        }
        if (!req.body.password) {
            res.render('register', { message: 'Chưa nhập mật khẩu' });
            return;
        }
        if (req.body.password !== req.body.retype) {
            res.render('register', { message: 'Mật khẩu nhập không khớp' });
            return;
        }

        const formData = {
            username: req.body.username,
            password: req.body.password
        };
        Account.find({ username: formData.username })
            .then(result => {
                if (result.length === 0) {
                    const account = new Account(formData);
                    account.save()
                        .then(() => res.redirect('/login'))
                        .catch(next);
                } else res.render('register', { message: 'Tên đăng nhập đã tồn tại' });
            })
            .catch(next);
    }
}

module.exports = new AuthController;
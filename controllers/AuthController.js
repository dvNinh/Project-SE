const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');
const order = require('../models/order');

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
        User.findOne(formData)
            .then(user => {
                if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
                req.session.regenerate(err => {
                    if (err) return next(err);
                    req.session.user = mongooseToObject(user);
                    req.session.save(err => {
                        if (err) return next(err);
                        res.redirect('/');
                    });
                });
            })
            .catch(next);
    }

    getRegister(req, res) {
        res.render('register');
    }

    postRegister(req, res, next) {
        for (var key in req.body)
            if (!req.body[key]) return res.render('register', { message: 'Vui lòng nhập đầy đủ thông tin' });
        if (req.body.password !== req.body.retype)
            return res.render('register', { message: 'Mật khẩu nhập không khớp' });

        const { retype, ...formData } = req.body;
        User.findOne({ username: formData.username })
            .then(user => {
                if (user) throw new Error('Tên đăng nhập đã tồn tại');
                const userCreate = new User(formData);
                userCreate.save();
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
                res.redirect('back');
            });
        });
    }

    getChangePass(req, res, next) {
        res.render('changePass');
    }

    postChangePass(req, res, next) {
        if (!req.body.username || !req.body.password || !req.body.newPassword || !req.body.retypeNewPassword)
            return res.render('change-pass', { message: 'Vui lòng nhập đầy đủ thông tin' });
        if (req.body.newPassword !== req.body.retypeNewPassword)
            return res.render('change-pass', { message: 'Mật khẩu nhập không khớp' });

        User.findOneAndUpdate({ username: req.body.username, password: req.body.password }, { password: req.body.newPassword })
            .then(() => res.redirect('/login'))
            .catch(next);
    }

    getProfile(req, res, next) {
        res.render('profile/view', {
            user: req.session.user
        });
    }

    getUpdateProfile(req, res, next) {
        res.render('profile/update', {
            user: req.session.user
        });
    }

    postUpdateProfile(req, res, next) {
        User.updateOne({ _id: req.params.id }, req.body)
            .then(() => User.findOne({ _id: req.params.id }))
            .then(user => {
                req.session.regenerate(err => {
                    if (err) return next(err);
                    req.session.user = mongooseToObject(user);
                    req.session.save(err => {
                        if (err) return next(err);
                        res.redirect('/profile/view');
                    });
                });
            })
            .catch(next);
    }

    showCart(req, res, next) {
        const username = req.session.user.username;
        Cart.find({ username })
            .then(carts => {
                //res.json(carts);

                const promises = carts.map(cart => Product.findOne({ _id: cart.productId }));
                //res.json(promises);
                Promise.all(promises)
                    .then(products => {

                        //res.json(products);

                        products = multipleMongooseToObject(products);
                        carts = carts.map((cart, index) => {
                            const product = products[index];
                            if (product) {
                                return {
                                    _id: cart._id,
                                    product: products[index],
                                    quantity: cart.quantity,
                                    price: products[index].price * cart.quantity
                                }
                            }
                        });
                        var totalPrice = carts.reduce((accumulator, cart) => {
                            /*
                            try {
                                return accumulator = accumulator + cart.price;
                            } catch (e) {
                                return accumulator;
                            }*/
                            if (cart && cart.price) {
                                return accumulator = accumulator + cart.price;
                            }
                            return accumulator;

                        }, 0);

                        var totalQuantity = carts.reduce((sum = 0, cart) => {
                            /*
                            try {
                                return accumulator = accumulator + cart.price;
                            } catch (e) {
                                return accumulator;
                            }*/
                            if (cart && cart.quantity) {
                                return sum = sum + cart.quantity;
                            }
                            return sum;

                        }, 0);

                        res.render('cart', {
                            user: req.session.user,
                            carts,
                            totalPrice,
                            totalQuantity
                        });
                    })
            })
            .catch(next)
    }

    deleteProductInCart(req, res, next) {
        Cart.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getPayment(req, res, next) {
        const username = req.session.user.username;
        //console.log(req.session)
        Cart.find({ username })
            .then(carts => {
                //res.json(carts);

                const promises = carts.map(cart => Product.findOne({ _id: cart.productId }));
                //res.json(promises);
                Promise.all(promises)
                    .then(products => {

                        //res.json(products);

                        products = multipleMongooseToObject(products);
                        carts = carts.map((cart, index) => {
                            const product = products[index];
                            if (product) {
                                return {
                                    _id: cart._id,
                                    product: products[index],
                                    quantity: cart.quantity,
                                    price: products[index].price * cart.quantity
                                }
                            }
                        });
                        var totalPrice = carts.reduce((accumulator, cart) => {
                            /*
                            try {
                                return accumulator = accumulator + cart.price;
                            } catch (e) {
                                return accumulator;
                            }*/
                            if (cart && cart.price) {
                                return accumulator = accumulator + cart.price;
                            }
                            return accumulator;

                        }, 0);

                        //console.log(carts);

                        res.render('payment', {
                            user: req.session.user,
                            carts,
                            totalPrice,
                        });
                    })
            })
            .catch(next)
    }

    exportOrder(req, res, next) {
        const formData = req.body;
        var username_ = formData.username;

        //console.log(username_);
        Cart.find({ username: username_ })
            .then(carts => {
                //res.json(carts);

                const promises = carts.map(cart => Product.findOne({ _id: cart.productId }));
                // console.log(promises);
                Promise.all(promises)
                    .then(products => {

                        //console.log(products);

                        products = multipleMongooseToObject(products);
                        carts = carts.map((cart, index) => {
                            const product = products[index];
                            if (product) {
                                return {
                                    _id: cart._id,
                                    product: products[index],
                                    quantity: cart.quantity,
                                    price: products[index].price * cart.quantity
                                }
                            }
                        });

                        //console.log(carts);

                        var totalPrice = carts.reduce((accumulator, cart) => {
                            /*
                            try {
                                return accumulator = accumulator + cart.price;
                            } catch (e) {
                                return accumulator;
                            }*/
                            if (cart && cart.price) {
                                return accumulator = accumulator + cart.price;
                            }
                            return accumulator;

                        }, 0);
                        //console.log(typeof(carts));

                        //const carts_ = multipleMongooseToObject(carts);
                        const data = {
                            name: req.body.fullName,
                            cart: products,
                            phoneNumber: req.body.phoneNumber,
                            date: req.body.Date,
                            address: req.body.address,
                        }


                        const userOrder = new order(data);
                        //console.log('userOrder.cart');
                        //console.log(userOrder.cart);
                        // console.log('product');
                        // console.log(products);

                        try {
                            userOrder.save()
                                .then(() =>
                                    res.redirect('/')
                                )
                                .catch(error => {
                                    res.json('ERROR!')
                                })
                        } catch (e) {
                            res.json('error')
                        }


                    })
            })
            .catch(next)

        // const data = {
        //     name: req.body.fullName,
        //     cart: req.session.user.cart,
        //     phoneNumber: req.body.phoneNumber,
        //     date: req.body.Date,
        //     address: req.body.address,
        // }
        // const userOrder = new order(data);
        // userOrder.save()
        //     .then(() =>
        //         res.redirect('/'))
        //     .catch(error => {
        //         res.json('ERROR!')
        //     });
    }

}

module.exports = new AuthController;
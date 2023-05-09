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

    loginValidate(req, res, next) {
        if (!req.body.username)
            return res.json({
                loginSuccess: false,
                message: 'Chưa nhập tên đăng nhập'
            });
        if (!req.body.password)
            return res.json({
                loginSuccess: false,
                message: 'Chưa nhập mật khẩu'
            });
        next();
    }

    postLogin(req, res, next) {
        const formData = req.body;
        User.findOne(formData)
            .then(user => {
                if (!user) return res.json({
                    loginSuccess: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
                req.session.regenerate(err => {
                    if (err) return err;
                    req.session.user = mongooseToObject(user);
                    req.session.save(err => {
                        if (err) return err;
                        res.json({
                            loginSuccess: true,
                            message: 'Đăng nhập thành công'
                        });
                    });
                });
            })
            .catch(next);
    }

    getRegister(req, res) {
        res.render('register');
    }

    registerValidate(req, res, next) {
        for (var key in req.body)
            if (!req.body[key]) return res.json({
                registerSuccess: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        if (req.body.password !== req.body.retype)
            return res.json({
                registerSuccess: false,
                message: 'Mật khẩu nhập không khớp'
            });
        next();
    }

    postRegister(req, res, next) {
        const { retype, ...formData } = req.body;
        User.findOne({ username: formData.username })
            .then(user => {
                if (user) return res.json({
                    registerSuccess: false,
                    message: 'Tên đăng nhập đã tồn tại'
                });
                const userCreate = new User(formData);
                userCreate.save();
                res.json({
                    registerSuccess: true,
                    message: 'Đăng kí tài khoản thành công'
                });
            })
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

    getChangePass(req, res) {
        res.render('changePass', {
            user: req.session.user
        });
    }

    changePassValidate(req, res, next) {
        if (!req.body.username || !req.body.password || !req.body.newPassword || !req.body.retypeNewPassword)
            return res.json({
                changePassSuccess: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        if (req.body.newPassword !== req.body.retypeNewPassword)
            return res.json({
                changePassSuccess: false,
                message: 'Mật khẩu nhập không khớp'
            });
        next();
    }

    postChangePass(req, res, next) {
        User.findOne({ username: req.body.username, password: req.body.password })
            .then(user => {
                if (!user) return res.json({
                    changePassSuccess: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
                User.findOneAndUpdate({ username: req.body.username, password: req.body.password }, { password: req.body.newPassword })
                    .then(() => res.json({
                        changePassSuccess: true,
                        message: 'Đổi mật khẩu thành công'
                    }));
            })
            .catch(next);
    }

    getProfile(req, res) {
        res.render('profile/view', {
            user: req.session.user
        });
    }

    getUpdateProfile(req, res) {
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
        if (!req.session.user) return res.render('cart/view', { user: undefined });
        const username = req.session.user.username;
        Cart.find({ username })
            .then(carts => {
                const promises = carts.map(cart => Product.findOne({ _id: cart.productId }));
                Promise.all(promises)
                    .then(products => {
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
                        req.session.carts = carts;
                        req.session.save();
                        res.render('cart/view', {
                            user: req.session.user,
                            carts: req.session.carts,
                        });
                    })
            })
            .catch(next);
    }

    getUpdateCart(req, res) {
        res.render('cart/update', {
            user: req.session.user,
            carts: req.session.carts,
        });
    }

    postUpdateCart(req, res, next) {
        if (!req.session.user) return res.render('cart/update', { user: undefined });
        var promises = [];
        for (var id in req.body) {
            req.session.carts.find(item => item._id === id).quantity = req.body[id];
            promises.push(Cart.updateOne({ _id: id }, { quantity: req.body[id] }));
        }
        Promise.all(promises)
            .then(() => res.redirect('/cart/view'))
            .catch(next);
    }

    deleteProductInCart(req, res, next) {
        Cart.deleteOne({ _id: req.params.id })
            .then(() => {
                var carts = req.session.carts;
                carts = carts.filter(item => item._id !== req.params.id);
                req.session.carts = carts;
                req.session.save();
            })
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
                        //carts_ = multipleMongooseToObject(carts);
                        let cartsId = [];
                        carts = carts.map((cart, index) => {
                            const product = products[index];
                            if (product) {
                                cartsId[cartsId.length] = cart._id;
                                return {
                                    _id: cart._id,
                                    product: products[index],
                                    quantity: cart.quantity,
                                    price: products[index].price * cart.quantity
                                }
                            }
                        });

                        // console.log(cartsId);


                        // var totalPrice = carts.reduce((accumulator, cart) => {
                        //     /*
                        //     try {
                        //         return accumulator = accumulator + cart.price;
                        //     } catch (e) {
                        //         return accumulator;
                        //     }*/
                        //     if (cart && cart.price) {
                        //         return accumulator = accumulator + cart.price;
                        //     }
                        //     return accumulator;

                        // }, 0);
                        //console.log(typeof(carts));

                        // const cartsCopy = [...cartsOriginal]; // Tạo bản sao của mảng carts
                        //console.log(cartsCopy);
                        // const formattedCarts = cartsCopy.map((formattedCarts, index) => {
                        //     const product = products[index];
                        //     if (product) {
                        //         return {
                        //             _id: formattedCarts._id,
                        //             product: products[index],
                        //             quantity: formattedCarts.quantity,
                        //             price: products[index].price * formattedCarts.quantity
                        //         }
                        //     }
                        // });
                        const data = {
                                username: username_,
                                name: req.body.fullName,
                                phoneNumber: req.body.phoneNumber,
                                date: req.body.Date,
                                address: req.body.address,
                            }
                            // const data = {
                            //     username: username_,
                            //     name: req.body.fullName,
                            //     cart: carts_,
                            //     phoneNumber: req.body.phoneNumber,
                            //     date: req.body.Date,
                            //     address: req.body.address,
                            // }

                        //console.log(data.cart);
                        const userOrder = new order(data);
                        // console.log(typeof(carts));
                        userOrder.cart = carts;
                        //console.log('userOrder.cart:');
                        //console.log(userOrder.cart);
                        // console.log('product');
                        // console.log(products);
                        console.log(username_);
                        try {
                            userOrder.save()
                                .then(() => {
                                    Cart.deleteMany({ username: username_ })
                                        .then(() => res.redirect('/'))
                                        .catch(e => {
                                            res.json('error')
                                        })

                                })
                                .catch(error => {
                                    res.json('error')
                                })
                        } catch (e) {
                            res.json('error')
                        }


                    })
            })
            .catch(next)
    }

    getBills(req, res, next) {
        const username = req.session.user.username;
        //console.log(req.session)
        order.find({ username: username })
            .then(orders => {
                orders = multipleMongooseToObject(orders);
                res.render('bills', { orders: orders })
            })
    }

}

module.exports = new AuthController;
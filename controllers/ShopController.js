const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Comment = require('../models/Comment');

const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');

var searchText;

class ShopController {
    getHome(req, res, next) {
        Product.find({})
            .then(products => {
                res.render('home', {
                    user: req.session.user,
                    products: multipleMongooseToObject(products),
                    search: true
                });
            })
            .catch(next);
    }

    create(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole != 'admin') {
            res.json('Bạn không có quyền truy cập chức năng này');
            return;
        }
        res.render('products/create', { user: req.session.user });
    }

    store(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole != 'admin') {
            res.json('Bạn không có quyền truy cập chức năng này');
            return;
        }
        const formData = req.body;
        formData['slug'] = req.body.name;
        const product = new Product(formData);
        product.save()
            .then(() =>
                res.redirect('/'))
            .catch(error => {});
    }

    getProduct(req, res, next) {
        Product.findOne({ slug: req.params.slug })
            .then(product => {
                if (!product) res.json({ status: false, message: 'Không tìm thấy sản phẩm' });
                else {
                    Comment.find({ productId: product._id })
                        .then(comments => {
                            res.render('products/show', {
                                user: req.session.user,
                                product: mongooseToObject(product),
                                comments: multipleMongooseToObject(comments)
                            });
                        });
                }
            })
            .catch(next);
    }

    getSearch(req, res, next) {
        searchText = req.query.searchText !== undefined ? req.query.searchText : searchText;

        Product.find({ name: { $regex: searchText } })
            .then(products => {
                res.render('search', {
                    title: 'Kết quả tìm kiếm cho' + searchText,
                    user: req.session.user,
                    searchProducts: multipleMongooseToObject(products),
                    searchT: searchText
                })
            })
            .catch(err => { console.log(err) })
    }

    addProductToCart(req, res, next) {
        if (!req.session.user) return res.json({
            addSuccess: false,
            message: 'Bạn cần đăng nhập để thực hiện chức năng này'
        });
        const data = {
            username: req.session.user.username,
            productId: req.params.id,
        };
        Cart.findOne(data)
            .then(cart => {
                if (!cart) {
                    const cart = new Cart(data);
                    cart.save();
                } else {
                    res.json({
                        addSuccess: false,
                        message: 'Không tìm thấy sản phẩm'
                    });
                }
            })
            .then(() => res.json({
                addSuccess: true,
                message: 'Đã thêm vào giỏ hàng'
            }))
            .catch(next);
    }

    warehouseProducts(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole == 'admin') {
                Promise.all([Product.find({}), Product.countDocumentsDeleted()])
                    .then(
                        ([products, deleteCount]) =>
                        res.render('admin/warehouse', {
                            user: req.session.user,
                            deleteCount,
                            products: multipleMongooseToObject(products)
                        })
                    )
                    .catch(next)
            } else {
                res.json('Bạn không có quyền truy cập chức năng này');
            }
        } catch (e) {
            res.render('error');
        }
    }

    oldBinProducts(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole == 'admin') {
                Product.findDeleted({})
                    .then((products) =>
                        res.render('admin/oldBin', {
                            user: req.session.user,
                            products: multipleMongooseToObject(products),
                        }),
                    )
                    .catch(next)
            } else {
                res.json('Bạn không có quyền truy cập chức năng này')
            }
        } catch (e) {
            res.render('error');
        }
    }

    edit(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole != 'admin') {
                res.json('Bạn không có quyền truy cập chức năng này');
                return;
            }

            Product.findById(req.params.id)
                .then(product => res.render('products/edit', {
                    product: mongooseToObject(product)
                }))
                .catch(next);
        } catch (e) {
            res.render('error')
        }
    }

    update(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole != 'admin') {
                res.json('Bạn không có quyền truy cập chức năng này');
                return;
            }

            Product.updateOne({ _id: req.params.id }, req.body)
                .then(() => res.redirect('admin/warehouse'))
                .catch(next);
        } catch (e) {
            res.render('error')
        }

    }

    destroy(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole != 'admin') {
                res.json('Bạn không có quyền truy cập chức năng này');
                return;
            }

            /*sofe delete*/
            Product.delete({ _id: req.params.id })
                .then(() => res.redirect('back'))
                .catch(next);
        } catch (e) {
            res.render('error');
        }

    }

    //DELETE /product/:id/force
    forceDestroy(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole != 'admin') {
                res.json('Bạn không có quyền truy cập chức năng này');
                return;
            }

            Product.deleteOne({ _id: req.params.id })
                .then(() => res.redirect('back'))
                .catch(next);
        } catch (e) {
            res.render('error')
        }
    }

    restore(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole != 'admin') {
                res.json('Bạn không có quyền truy cập chức năng này');
                return;
            }
            Product.restore({ _id: req.params.id })
                .then(() => res.redirect('back'))
                .catch(next);
        } catch (e) {
            res.render('error')
        }

    }

    handleFormActions(req, res, next) {
        try {
            const userRole = req.session.user.role;
            if (userRole != 'admin') {
                res.json('Bạn không có quyền truy cập chức năng này');
                return;
            }

            switch (req.body.action) {
                case 'delete':
                    Product.delete({ _id: { $in: req.body.productIds } })
                        .then(() => res.redirect('back'))
                        .catch(next);
                    break;
                default:
                    res.json({ message: 'Tính năng chưa được mở khóa' });
            }
        } catch (e) {
            res.render('error')
        }
    }   

    productRating(req, res, next) {
        const formData = {
            username: req.session.user.username,
            userAvatar: req.session.user.avatar,
            productId: req.params.id,
            content: req.body.content,
            star: req.body.star
        }
        const comment = new Comment(formData);
        comment.save();
        res.redirect('back');
    }

    exportOrder(req,res,next) {
        const data = {
            name: req.body.fullName,
            phoneNumber: req.body.phoneNumber,
            date: req.body.Date,
            address: req.body.address
        }
        const userOrder = new order(data);
        userOrder.save();
    }
}

module.exports = new ShopController;

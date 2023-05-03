const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Comment = require('../models/Comment');

const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');
const order = require('../models/order');

var searchText;

class ShopController {
    getHome(req, res, next) {
        Product.find({})
            .then(products => {
                res.render('home', {
                    user: req.session.user,
                    products: multipleMongooseToObject(products)
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
        res.render('products/create');
    }

    store(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole != 'admin') {
            res.json('Bạn không có quyền truy cập chức năng này');
            return;
        }
        const formData = req.body;
        const product = new Product(formData);
        product.save()
            .then(() =>
                res.redirect('/'))
            .catch(error => {});
    }

    getProduct(req, res, next) {
        Product.findOne({ slug: req.params.slug })
            .then(product => {
                Comment.find({ productId: product._id })
                    .then(comments => {
                        res.render('products/show', {
                            user: req.session.user,
                            product: mongooseToObject(product),
                            comments: multipleMongooseToObject(comments)
                        });
                    });
            })
            .catch(next);
    }

    getSearch(req, res, next) {
        searchText = req.query.searchText !== undefined ? req.query.searchText : searchText;

        Product.find({ name: { $regex: searchText } })
            .then(products => {
                res.render('search', {
                    title: 'Kết quả tìm kiếm cho' + searchText,
                    user: req.user,
                    searchProducts: multipleMongooseToObject(products),
                    searchT: searchText
                })
            })
            .catch(err => { console.log(err) })
    }

    addProductToCart(req, res, next) {
        if (!req.session.user) return res.redirect('/login');
        const data = {
            username: req.session.user.username,
            productId: req.params.id,
            role: req.params.role
        };
        Cart.findOne(data)
            .then(cart => {
                if (!cart) {
                    const cart = new Cart(data);
                    cart.save();
                }
            })
            .then(() => res.json({ success: true, message: 'Đã thêm vào giỏ hàng' }))
            .catch(next);
    }

    warehouseProducts(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole == 'admin') {
            Promise.all([Product.find({}), Product.countDocumentsDeleted()])
                .then(
                    ([products, deleteCount]) =>
                    res.render('admin/warehouse', {
                        deleteCount,
                        products: multipleMongooseToObject(products)
                    })
                )
                .catch(next)
        } else {
            res.json('Bạn không có quyền truy cập chức năng này')
        }
    }

    oldBinProducts(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole == 'admin') {
            Product.findDeleted({})
                .then((products) =>
                    res.render('admin/oldBin', {
                        products: multipleMongooseToObject(products),
                    }),
                )
                .catch(next)
        } else {
            res.json('Bạn không có quyền truy cập chức năng này')
        }
    }

    edit(req, res, next) {
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
    }

    update(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole != 'admin') {
            res.json('Bạn không có quyền truy cập chức năng này');
            return;
        }

        Product.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('admin/warehouse'))
            .catch(next);
    }

    destroy(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole != 'admin') {
            res.json('Bạn không có quyền truy cập chức năng này');
            return;
        }

        /*sofe delete*/
        Product.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    restore(req, res, next) {
        const userRole = req.session.user.role;
        if (userRole != 'admin') {
            res.json('Bạn không có quyền truy cập chức năng này');
            return;
        }
        Product.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    handleFormActions(req, res, next) {
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
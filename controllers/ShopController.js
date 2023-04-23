const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');
var users = require('../models/User')

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
        res.render('products/create');
    }

    store(req, res, next) {
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
                res.render('products/show', {
                    user: req.session.user,
                    product: mongooseToObject(product)
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
                    searchT: searchText,
                    //cartProduct:cartProduct
                })
            })
            .catch(err => { console.log(err) })
    }

    addProductToCart(req, res, next) {
        const data = {
            username: req.session.user.username,
            productId: req.params.id
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
        Promise.all([Product.find({}), Product.countDocumentsDeleted()])
            .then(
                ([products, deleteCount]) =>
                res.render('admin/warehouse', {
                    deleteCount,
                    products: multipleMongooseToObject(products)
                })
            )
            .catch(next)
    }

    oldBinProducts(req, res, next) {
        Product.findDeleted({})
            .then((products) =>
                res.render('admin/oldBin', {
                    products: multipleMongooseToObject(products),
                }),
            )
            .catch(next)
    }

    edit(req, res, next) {
        Product.findById(req.params.id)
            .then(product => res.render('products/edit', {
                product: mongooseToObject(product)
            }))
            .catch(next);
    }

    update(req, res, next) {
        Product.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('admin/warehouse'))
            .catch(next);
    }

    destroy(req, res, next) {

        /*sofe delete*/
        Product.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    restore(req, res, next) {
        Product.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    handleFormActions(req, res, next) {
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
    getPayment(req,res,next) {
        res.render('payment')
    }
}
module.exports = new ShopController;
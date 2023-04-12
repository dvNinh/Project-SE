const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');

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

    handleFormActions(req, res, next) {
        res.render('Handle form action');
    }
}

module.exports = new ShopController;
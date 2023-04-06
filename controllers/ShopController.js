const Product = require('../models/Product');
const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');

class ShopController {
    getHome(req, res, next) {
        Product.find({})
            .then(products => {
                res.render('home', {
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
                    product: mongooseToObject(product)
                });
            })
            .catch(next);
    }

    getCart(req,res,next) {
        res.render('/cart')
    }
}

module.exports = new ShopController;
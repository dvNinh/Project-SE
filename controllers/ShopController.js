const Product = require('../models/Product');
const { multipleMongooseToObject } = require('../util/mongoose');

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
        const product = new Product;
        product.save()
            .then(() =>
                res.redirect('/'))
            .catch(error => {});
    }
}

module.exports = new ShopController;
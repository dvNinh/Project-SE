const Product = require('../models/Product');
const { multipleMongooseToObject } = require('../util/mongoose');
const { mongooseToObject } = require('../util/mongoose');
const Cart = require('../models/cart')
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

    getSearch(req,res,next) {
        // var cartProduct;
        // if (!req.session.cart) cartProduct = null;
        // else {
        //     var cart = new cart(req.session.cart);
        //     cartProduct = cart.generateArray();
        // }
        searchText = req.query.searchText !== undefined ? req.query.searchText : searchText;

        // Product.createIndexes({}).catch(err => {
        //     console.log(err);
        // })
        // Product.find({
        //     $text: {$search: searchText}
        // })
        //  .countDocuments()
        //  .then(numProduct => {
        //     totalItems = numProduct
        //     return Product.find({$text : {$search:searchText}})
         //.skip((page - 1) *12)
         //.limit(12);
        //})
          
        Product.find({name:{$regex:searchText}})
        .then(products => {
            res.render('search',{
                title: 'Kết quả tìm kiếm cho' + searchText,
                user:req.user,
                searchProducts: products,
                searchT:searchText,
                //cartProduct:cartProduct
            })
        })
        .catch(err =>{console.log(err)})   
        //res.render('search')     
    }
}

module.exports = new ShopController;
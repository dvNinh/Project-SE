const express = require('express');
const router = express.Router();
const shopController = require('../controllers/ShopController');

router.get('/home', shopController.getHome);
router.get('/shop/create', shopController.create);
router.post('/shop/store', shopController.store);
router.get('/warehouse', shopController.warehouseProducts);
router.post('/handle-form-actions', shopController.handleFormActions);
router.get('/product/add-to-cart/:id', shopController.addProductToCart);
router.get('/products/:slug', shopController.getProduct);
router.get('/', shopController.getHome);

module.exports = router;
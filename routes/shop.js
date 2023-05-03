const express = require('express');
const router = express.Router();
const shopController = require('../controllers/ShopController');
const ShopController = require('../controllers/ShopController');

router.get('/home', shopController.getHome);

router.get('/shop/create', shopController.create);
router.post('/shop/store', shopController.store);

router.get('/admin/warehouse', shopController.warehouseProducts);
router.get('/oldBin', shopController.oldBinProducts)
router.post('/products/handle-form-actions', shopController.handleFormActions);
router.get('/products/:id/edit', shopController.edit);
router.delete('/products/:id/delete', shopController.destroy);
router.delete('/products/:id/force', shopController.forceDestroy);

router.patch('/products/:id/restore', shopController.restore);
router.put('/:id', ShopController.update);

router.get('/product/add-to-cart/:id', shopController.addProductToCart);
router.get('/products/:slug', shopController.getProduct);
router.post('/product/rating/:id', shopController.productRating);

router.post('/payment', shopController.exportOrder);

router.get('/search', shopController.getSearch);
router.get('/', shopController.getHome);

module.exports = router;
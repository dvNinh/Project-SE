const express = require('express');
const router = express.Router();
const shopController = require('../controllers/ShopController');

router.get('/home', shopController.getHome);
router.get('/shop/create', shopController.create);
router.post('/shop/store', shopController.store);
router.get('/', shopController.getHome);

module.exports = router;
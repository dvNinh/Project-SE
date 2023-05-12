const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.get('/payment', authController.getPayment);
router.post('/post_payment', authController.exportOrder);

router.get('/login', authController.getLogin);
router.post('/login', authController.loginValidate, authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.registerValidate, authController.postRegister);

router.get('/logout', authController.logout);

router.get('/change-pass', authController.getChangePass);
router.post('/change-pass', authController.changePassValidate, authController.postChangePass);

router.get('/profile/view', authController.getProfile);
router.get('/profile/update', authController.getUpdateProfile);
router.post('/profile/update/:id', authController.postUpdateProfile);

router.get('/cart/view', authController.showCart);
router.get('/cart/update', authController.getUpdateCart);
router.post('/cart/update', authController.postUpdateCart);
router.post('/cart/delete/:id', authController.deleteProductInCart);

router.get('/payment', authController.getPayment);
router.get('/bills', authController.getBills)

module.exports = router;

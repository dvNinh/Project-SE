const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

router.get('/change-pass', authController.getChangePass);
router.post('/change-pass', authController.postChangePass);

router.get('/profile/view', authController.getProfile);
router.get('/profile/update', authController.getUpdateProfile);
router.post('/profile/update/:id', authController.postUpdateProfile);

router.get('/cart', authController.showCart);
router.post('/cart/delete/:id', authController.deleteProductInCart);

module.exports = router;
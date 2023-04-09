const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const AuthController = require('../controllers/AuthController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

router.get('/profile/view', authController.getProfile);
router.get('/profile/update', authController.getUpdateProfile);
router.post('/profile/update/:id', authController.postUpdateProfile);
router.get('/cart/:username', AuthController.showCart)

module.exports = router;
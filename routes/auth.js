const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

router.get('/profile', authController.getProfile);
router.post('/profile/update', authController.updateProfile);

module.exports = router;
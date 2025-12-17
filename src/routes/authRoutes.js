const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Маршруты аутентификации
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/session', AuthController.getSession);

module.exports = router;

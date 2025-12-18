const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Маршруты аутентификации
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/session', AuthController.getSession);

// Защищенные маршруты (требуют авторизации)
router.get('/user', requireAuth, AuthController.getCurrentUser);

module.exports = router;

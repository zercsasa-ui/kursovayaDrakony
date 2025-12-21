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
router.post('/verify-password', requireAuth, AuthController.verifyPassword);
router.delete('/account', requireAuth, AuthController.deleteAccount);

module.exports = router;

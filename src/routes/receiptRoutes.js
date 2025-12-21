const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createReceipt } = require('../controllers/receiptController');

// Все роуты чеков требуют аутентификации
router.use(requireAuth);

// Создать чек
router.post('/', createReceipt);

module.exports = router;

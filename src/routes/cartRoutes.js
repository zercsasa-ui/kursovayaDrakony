const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
} = require('../controllers/cartController');

// Все роуты корзины требуют аутентификации
router.use(requireAuth);

// Получить корзину пользователя
router.get('/', getCart);

// Добавить товар в корзину
router.post('/', addToCart);

// Удалить товар из корзины
router.delete('/:productId', removeFromCart);

// Обновить количество товара в корзине
router.put('/:productId', updateCartItem);

// Очистить корзину
router.delete('/', clearCart);

module.exports = router;

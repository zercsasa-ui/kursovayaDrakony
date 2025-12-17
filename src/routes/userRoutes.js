const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Публичные маршруты (без аутентификации)
router.post('/', UserController.createUser);

// Защищенные маршруты (требуют аутентификации)
router.use(requireAuth); // Все следующие маршруты требуют аутентификации

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);

// Только для администраторов
router.delete('/:id', requireAdmin, UserController.deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const UserController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Настройка multer для загрузки аватаров
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/utImages'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Публичные маршруты (без аутентификации)
router.post('/', UserController.createUser);
router.get('/public', UserController.getAllUsersPublic); // Публичный маршрут для галереи

// Защищенные маршруты (требуют аутентификации)
router.use(requireAuth); // Все следующие маршруты требуют аутентификации

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', upload.any(), UserController.updateUser);

// Только для администраторов
router.delete('/:id', requireAdmin, UserController.deleteUser);

module.exports = router;

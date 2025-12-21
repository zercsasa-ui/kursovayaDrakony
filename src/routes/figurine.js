console.log('Loading figurine routes...');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const { Product } = require('../models/figurines');
const { deleteImageFile } = require('../utils/fileUtils');
console.log('Figurine routes dependencies loaded');

// Настройка multer для загрузки изображений драконов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/utImages'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'figurine-' + uniqueSuffix + path.extname(file.originalname));
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
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Получить все драконы
router.get('/', async (req, res) => {
  try {
    const dragons = await Product.findAll({
      where: { type: 'dragon' },
      order: [['id', 'ASC']]
    });
    res.json(dragons);
  } catch (error) {
    console.error('Error fetching dragons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить дракона по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dragon = await Product.findOne({
      where: { id, type: 'dragon' }
    });

    if (!dragon) {
      return res.status(404).json({ error: 'Dragon not found' });
    }

    res.json(dragon);
  } catch (error) {
    console.error('Error fetching dragon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать нового дракона
router.post('/', upload.any(), async (req, res) => {
  try {
    const { price, name, description, composition, imageUrl, color, inStock, popularity, specialOffer } = req.body;

    // Если загружен файл, используем его путь, иначе используем imageUrl из тела
    let imagePath = imageUrl;
    if (req.files && req.files.length > 0) {
      // Найдем файл с именем 'imageUrl' или первый файл
      const imageFile = req.files.find(file => file.fieldname === 'imageUrl') || req.files[0];
      if (imageFile) {
        imagePath = `/utImages/${imageFile.filename}`;
      }
    }

    const dragon = await Product.create({
      type: 'dragon',
      price,
      name,
      description,
      composition,
      imageUrl: imagePath,
      color,
      inStock: inStock || 0,
      popularity: popularity || 0,
      specialOffer: specialOffer === 'true' || specialOffer === true,
    });

    res.status(201).json(dragon);
  } catch (error) {
    console.error('Error creating dragon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить дракона
router.put('/:id', upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, description, composition, imageUrl, color, inStock, popularity, specialOffer } = req.body;

    // Получаем текущего дракона, чтобы узнать старый путь к изображению
    const currentDragon = await Product.findOne({
      where: { id, type: 'dragon' }
    });

    if (!currentDragon) {
      return res.status(404).json({ error: 'Dragon not found' });
    }

    // Если загружен файл, используем его путь, иначе используем imageUrl из тела
    let imagePath = imageUrl;
    let oldImagePath = null;

    if (req.files && req.files.length > 0) {
      // Найдем файл с именем 'imageUrl' или первый файл
      const imageFile = req.files.find(file => file.fieldname === 'imageUrl') || req.files[0];
      if (imageFile) {
        imagePath = `/utImages/${imageFile.filename}`;
        // Сохраняем старый путь к изображению для удаления
        oldImagePath = currentDragon.imageUrl;
      }
    }

    const [updatedRowsCount] = await Product.update(
      {
        price,
        name,
        description,
        composition,
        imageUrl: imagePath,
        color,
        inStock: inStock || 0,
        popularity: popularity || 0,
        specialOffer: specialOffer === 'true' || specialOffer === true,
      },
      {
        where: { id, type: 'dragon' }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Dragon not found' });
    }

    // Удаляем старое изображение, если было загружено новое
    if (oldImagePath && imagePath !== oldImagePath) {
      deleteImageFile(oldImagePath);
    }

    const updatedDragon = await Product.findOne({
      where: { id, type: 'dragon' }
    });

    res.json(updatedDragon);
  } catch (error) {
    console.error('Error updating dragon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить дракона
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем дракона перед удалением, чтобы узнать путь к изображению
    const dragon = await Product.findOne({
      where: { id, type: 'dragon' }
    });

    if (!dragon) {
      return res.status(404).json({ error: 'Dragon not found' });
    }

    // Удаляем изображение товара
    const imageDeletionPromise = deleteImageFile(dragon.imageUrl);

    // Удаляем товар из базы данных
    const deletedRowsCount = await Product.destroy({
      where: { id, type: 'dragon' }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'Dragon not found' });
    }

    // Ждем завершения удаления изображения
    await imageDeletionPromise;

    res.json({ message: 'Dragon deleted successfully' });
  } catch (error) {
    console.error('Error deleting dragon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

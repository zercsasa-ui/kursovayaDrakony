console.log('Loading kykly routes...');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const { Product } = require('../models/figurines');
console.log('Kykly routes dependencies loaded');

// Настройка multer для загрузки изображений кукол
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'kykly-' + uniqueSuffix + path.extname(file.originalname));
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

// Получить все куклы
router.get('/', async (req, res) => {
  try {
    const dolls = await Product.findAll({
      where: { type: 'doll' },
      order: [['id', 'ASC']]
    });
    res.json(dolls);
  } catch (error) {
    console.error('Error fetching dolls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить куклу по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doll = await Product.findOne({
      where: { id, type: 'doll' }
    });

    if (!doll) {
      return res.status(404).json({ error: 'Doll not found' });
    }

    res.json(doll);
  } catch (error) {
    console.error('Error fetching doll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новую куклу
router.post('/', upload.any(), async (req, res) => {
  try {
    const { price, name, description, composition, imageUrl, color, inStock, popularity, specialOffer } = req.body;

    // Если загружен файл, используем его путь, иначе используем imageUrl из тела
    let imagePath = imageUrl;
    if (req.files && req.files.length > 0) {
      // Найдем файл с именем 'imageUrl' или первый файл
      const imageFile = req.files.find(file => file.fieldname === 'imageUrl') || req.files[0];
      if (imageFile) {
        imagePath = `/images/${imageFile.filename}`;
      }
    }

    const doll = await Product.create({
      type: 'doll',
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

    res.status(201).json(doll);
  } catch (error) {
    console.error('Error creating doll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить куклу
router.put('/:id', upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, description, composition, imageUrl, color, inStock, popularity, specialOffer } = req.body;

    // Если загружен файл, используем его путь, иначе используем imageUrl из тела
    let imagePath = imageUrl;
    if (req.files && req.files.length > 0) {
      // Найдем файл с именем 'imageUrl' или первый файл
      const imageFile = req.files.find(file => file.fieldname === 'imageUrl') || req.files[0];
      if (imageFile) {
        imagePath = `/images/${imageFile.filename}`;
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
        where: { id, type: 'doll' }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Doll not found' });
    }

    const updatedDoll = await Product.findOne({
      where: { id, type: 'doll' }
    });

    res.json(updatedDoll);
  } catch (error) {
    console.error('Error updating doll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить куклу
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Product.destroy({
      where: { id, type: 'doll' }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'Doll not found' });
    }

    res.json({ message: 'Doll deleted successfully' });
  } catch (error) {
    console.error('Error deleting doll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

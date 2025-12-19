console.log('Loading props routes...');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const { Product } = require('../models/figurines');
console.log('Props routes dependencies loaded');

// Настройка multer для загрузки изображений пропов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'props-' + uniqueSuffix + path.extname(file.originalname));
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

// Получить все пропы
router.get('/', async (req, res) => {
  try {
    const props = await Product.findAll({
      where: { type: 'props' },
      order: [['id', 'ASC']]
    });
    res.json(props);
  } catch (error) {
    console.error('Error fetching props:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить проп по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prop = await Product.findOne({
      where: { id, type: 'props' }
    });

    if (!prop) {
      return res.status(404).json({ error: 'Prop not found' });
    }

    res.json(prop);
  } catch (error) {
    console.error('Error fetching prop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новый проп
router.post('/', upload.any(), async (req, res) => {
  try {
    const { price, name, description, composition, imageUrl, color } = req.body;

    // Если загружен файл, используем его путь, иначе используем imageUrl из тела
    let imagePath = imageUrl;
    if (req.files && req.files.length > 0) {
      // Найдем файл с именем 'imageUrl' или первый файл
      const imageFile = req.files.find(file => file.fieldname === 'imageUrl') || req.files[0];
      if (imageFile) {
        imagePath = `/images/${imageFile.filename}`;
      }
    }

    const prop = await Product.create({
      type: 'props',
      price,
      name,
      description,
      composition,
      imageUrl: imagePath,
      color,
    });

    res.status(201).json(prop);
  } catch (error) {
    console.error('Error creating prop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить проп
router.put('/:id', upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, description, composition, imageUrl, color } = req.body;

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
      },
      {
        where: { id, type: 'props' }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Prop not found' });
    }

    const updatedProp = await Product.findOne({
      where: { id, type: 'props' }
    });

    res.json(updatedProp);
  } catch (error) {
    console.error('Error updating prop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить проп
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Product.destroy({
      where: { id, type: 'props' }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'Prop not found' });
    }

    res.json({ message: 'Prop deleted successfully' });
  } catch (error) {
    console.error('Error deleting prop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

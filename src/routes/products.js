console.log('Loading products routes...');
const express = require('express');
const router = express.Router();
const { Product } = require('../models/figurines');
const { Op } = require('sequelize');
console.log('Products routes dependencies loaded');

// Получить все товары (драконы + куклы)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['id', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить последний добавленный товар
router.get('/latest', async (req, res) => {
  try {
    const latestProduct = await Product.findOne({
      order: [['id', 'DESC']]
    });
    if (!latestProduct) {
      return res.status(404).json({ error: 'No products found' });
    }
    res.json(latestProduct);
  } catch (error) {
    console.error('Error fetching latest product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Поиск товаров по названию
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const searchTerm = q.trim();
    const products = await Product.findAll({
      where: {
        [Op.and]: [
          Product.sequelize.where(
            Product.sequelize.fn('LOWER', Product.sequelize.col('name')),
            {
              [Op.like]: `%${searchTerm.toLowerCase()}%`
            }
          )
        ]
      },
      limit: 10,
      order: [['popularity', 'DESC'], ['name', 'ASC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

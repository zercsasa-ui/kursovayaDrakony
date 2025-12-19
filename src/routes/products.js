console.log('Loading products routes...');
const express = require('express');
const router = express.Router();
const { Product } = require('../models/figurines');
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

module.exports = router;

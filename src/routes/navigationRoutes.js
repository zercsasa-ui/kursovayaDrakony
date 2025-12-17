const express = require('express');
const router = express.Router();
const navigationController = require('../controllers/navigationController');

// Маршрут для получения хлебных крошек
router.get('/breadcrumbs', navigationController.getBreadcrumbs);

// Маршруты для навигации между страницами
router.get('/:page', navigationController.navigateToPage);

module.exports = router;

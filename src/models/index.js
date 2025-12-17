const { Sequelize } = require('sequelize');
const path = require('path');

// Создание экземпляра Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.db'),
  logging: false, // Отключить логирование SQL запросов
});

module.exports = sequelize;

// Импорт моделей для их регистрации после экспорта sequelize
require('./figurines');

const { Sequelize } = require('sequelize');
const path = require('path');

// Создание экземпляра Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.db'),
  logging: false, // Отключить логирование SQL запросов
});

module.exports = sequelize;

const { Product, Drakoni, Kykly } = require('./figurines');


Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

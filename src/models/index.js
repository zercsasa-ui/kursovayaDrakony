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
const Cart = require('./cart');
const Order = require('./order');

// Экспортируем модели
module.exports.Cart = Cart;
module.exports.Product = Product;
module.exports.Drakoni = Drakoni;
module.exports.Kykly = Kykly;
module.exports.Order = Order;

// Установка ассоциаций
Product.hasMany(Cart, { foreignKey: 'productId', onDelete: 'CASCADE' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

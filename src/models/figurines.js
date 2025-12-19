const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// Единая модель для всех товаров (драконы + куклы)
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('dragon', 'doll', 'props'),
    allowNull: false,
    defaultValue: 'dragon',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  composition: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.ENUM('Красный', 'Черный', 'Цветной'),
    allowNull: true,
  },
}, {
  tableName: 'Products',
  timestamps: false,
});

// Для обратной совместимости - алиасы для старых названий
const Drakoni = Product;
const Kykly = Product;

module.exports = { Product, Drakoni, Kykly };

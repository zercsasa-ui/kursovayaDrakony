const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  items: {
    type: DataTypes.TEXT, // JSON string containing cart items
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Собираем', 'В пути', 'Доставлен', 'Создаем кастомуную фигурку'),
    allowNull: false,
    defaultValue: 'Собираем',
  },
  customerData: {
    type: DataTypes.TEXT, // JSON string containing customer delivery info
    allowNull: true,
  },
}, {
  tableName: 'Orders',
  timestamps: true,
});

module.exports = Order;

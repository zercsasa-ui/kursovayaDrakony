const { Cart, Product } = require('../models');

// Получить корзину пользователя
const getCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'description', 'imageUrl', 'color', 'inStock', 'type', 'popularity', 'specialOffer', 'composition'] }]
    });

    // console.log(`getCart: User ${userId} has ${cartItems.length} items in cart`);

    // Форматируем данные для фронтенда
    const formattedItems = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      description: item.product.description,
      image: item.product.imageUrl, // Для совместимости с CartPage
      color: item.product.color,
      composition: item.product.composition,
      inStock: item.product.inStock,
      quantity: item.quantity,
      type: item.product.type
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Ошибка при получении корзины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Добавить товар в корзину
const addToCart = async (req, res) => {
  try {
    console.log('addToCart: Session =', req.session);
    const userId = req.session.userId;
    console.log('addToCart: userId =', userId);
    if (!userId) {
      console.log('addToCart: User not authenticated');
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const { productId, quantity = 1 } = req.body;
    console.log('addToCart: productId =', productId, 'quantity =', quantity);

    if (!productId) {
      return res.status(400).json({ error: 'Не указан ID товара' });
    }

    // Проверяем, существует ли товар
    const product = await Product.findByPk(productId);
    if (!product) {
      console.log('addToCart: Product not found');
      return res.status(404).json({ error: 'Товар не найден' });
    }

    console.log('addToCart: Product inStock =', product.inStock);

    // Проверяем наличие товара на складе
    if (product.inStock < quantity) {
      console.log('addToCart: Not enough stock');
      return res.status(400).json({ error: 'Недостаточно товара на складе' });
    }

    // Ищем существующий элемент корзины
    const existingItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (existingItem) {
      // Обновляем количество - проверяем, достаточно ли товара для ДОБАВЛЕНИЯ quantity
      if (product.inStock < quantity) {
        console.log('addToCart: Not enough stock for additional quantity, inStock:', product.inStock, 'additional quantity:', quantity);
        return res.status(400).json({ error: 'Недостаточно товара на складе' });
      }

      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      // Создаем новый элемент корзины
      if (product.inStock < quantity) {
        console.log('addToCart: Not enough stock for new item, inStock:', product.inStock, 'quantity:', quantity);
        return res.status(400).json({ error: 'Недостаточно товара на складе' });
      }

      await Cart.create({
        userId,
        productId,
        quantity
      });
    }

    // Обновляем количество на складе
    product.inStock -= quantity;
    await product.save();

    res.json({ success: true, message: 'Товар добавлен в корзину' });
  } catch (error) {
    console.error('Ошибка при добавлении в корзину:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить товар из корзины
const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: 'Не указан ID товара' });
    }

    // Ищем элемент корзины
    const cartItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Товар не найден в корзине' });
    }

    // Возвращаем товар на склад
    const product = await Product.findByPk(productId);
    if (product) {
      product.inStock += cartItem.quantity;
      await product.save();
    }

    // Удаляем из корзины
    await cartItem.destroy();

    res.json({ success: true, message: 'Товар удален из корзины' });
  } catch (error) {
    console.error('Ошибка при удалении из корзины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить количество товара в корзине
const updateCartItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Не указан ID товара или количество' });
    }

    if (quantity <= 0) {
      return removeFromCart(req, res);
    }

    // Ищем элемент корзины
    const cartItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Товар не найден в корзине' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const quantityDifference = quantity - cartItem.quantity;

    // Проверяем наличие товара на складе
    if (quantityDifference > 0 && product.inStock < quantityDifference) {
      return res.status(400).json({ error: 'Недостаточно товара на складе' });
    }

    // Обновляем количество в корзине
    cartItem.quantity = quantity;
    await cartItem.save();

    // Обновляем склад
    product.inStock -= quantityDifference;
    await product.save();

    res.json({ success: true, message: 'Количество товара обновлено' });
  } catch (error) {
    console.error('Ошибка при обновлении корзины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Очистить корзину
const clearCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    // Получаем все товары из корзины
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'description', 'imageUrl', 'color', 'inStock', 'type', 'popularity', 'specialOffer', 'composition'] }]
    });

    // Возвращаем товары на склад
    for (const item of cartItems) {
      if (item.product) {
        item.product.inStock += item.quantity;
        await item.product.save();
      }
    }

    // Очищаем корзину
    await Cart.destroy({
      where: { userId }
    });

    res.json({ success: true, message: 'Корзина очищена' });
  } catch (error) {
    console.error('Ошибка при очистке корзины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
};

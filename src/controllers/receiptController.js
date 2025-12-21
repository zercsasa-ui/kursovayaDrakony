const fs = require('fs');
const path = require('path');
const { UserModel } = require('../database/database');
const { Product, Order } = require('../models');

// Создать чек
const createReceipt = async (req, res) => {
    try {
        const { cartItems, totalPrice, customerData } = req.body;

        // Получить информацию о пользователе из сессии
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста или данные некорректны' });
        }

        // Создаем директорию Cheks если её нет
        const cheksDir = path.join(__dirname, '../../public/Cheks');
        if (!fs.existsSync(cheksDir)) {
            fs.mkdirSync(cheksDir, { recursive: true });
        }

        // Генерируем уникальное имя файла с датой и временем
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        const receiptName = `${dateStr}_${timeStr}.txt`;
        const filePath = path.join(cheksDir, receiptName);

        // Создаем содержимое чека
        let receiptContent = `ЧЕК ПОКУПКИ\n`;
        receiptContent += `Дата: ${dateStr}\n`;
        receiptContent += `Время: ${timeStr}\n`;
        receiptContent += `============================\n\n`;

        // Информация о покупателе
        receiptContent += `ПОКУПАТЕЛЬ:\n`;
        if (customerData) {
            receiptContent += `ФИО: ${customerData.firstName} ${customerData.lastName}\n`;
            receiptContent += `Телефон: ${customerData.phone || 'Не указан'}\n`;
            receiptContent += `Email: ${customerData.email}\n`;
            if (customerData.city || customerData.address || customerData.postalCode) {
                receiptContent += `Адрес доставки: ${customerData.city || ''} ${customerData.address || ''} ${customerData.postalCode || ''}\n`.trim();
            }
        } else {
            receiptContent += `Имя пользователя: ${user.username}\n`;
            receiptContent += `Email: ${user.email}\n`;
        }
        receiptContent += `============================\n\n`;

        // Реквизиты получателя
        receiptContent += `РЕКВИЗИТЫ ПОЛУЧАТЕЛЯ:\n`;
        receiptContent += `Получатель: ***\n`;
        receiptContent += `ИНН: ***\n`;
        receiptContent += `Номер карты: ***\n`;
        receiptContent += `Банк: ***\n`;
        receiptContent += `============================\n\n`;

        receiptContent += `ТОВАРЫ:\n`;

        cartItems.forEach(item => {
            receiptContent += `${item.name} x${item.quantity} - ${item.price * item.quantity} ₽\n`;
        });

        receiptContent += `\n============================\n`;
        receiptContent += `Итого: ${totalPrice} ₽\n`;
        receiptContent += `============================\n`;
        receiptContent += `Спасибо за покупку!\n`;

        // Обновляем популярность товаров вместо возврата на склад
        for (const item of cartItems) {
            try {
                const product = await Product.findByPk(item.id);
                if (product) {
                    product.popularity += item.quantity;
                    await product.save();
                    console.log(`Обновлена популярность товара ${item.name}: +${item.quantity}`);
                }
            } catch (error) {
                console.error(`Ошибка при обновлении популярности товара ${item.name}:`, error);
            }
        }

        // Записываем файл
        fs.writeFileSync(filePath, receiptContent, 'utf8');

        console.log(`Чек создан: ${filePath}`);

        // Создаем заказ в базе данных
        try {
            const order = await Order.create({
                userId: userId,
                items: JSON.stringify(cartItems),
                totalPrice: totalPrice,
                customerData: customerData ? JSON.stringify(customerData) : null,
                status: 'Собираем'
            });
            console.log(`Заказ создан: ${order.id}`);
        } catch (orderError) {
            console.error('Ошибка при создании заказа:', orderError);
            // Не прерываем процесс, если создание заказа не удалось
        }

        res.json({
            success: true,
            message: 'Чек успешно создан',
            receiptPath: `/Cheks/${receiptName}`
        });

    } catch (error) {
        console.error('Ошибка при создании чека:', error);
        res.status(500).json({ error: 'Ошибка при создании чека' });
    }
};

module.exports = {
    createReceipt
};

const express = require('express');
const router = express.Router();
const { Order } = require('../models');
const { requireAuth } = require('../middleware/auth');

// Получить заказы пользователя
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        const orders = await Order.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']]
        });

        // Преобразуем данные для клиента
        const formattedOrders = orders.map(order => ({
            id: order.id,
            items: JSON.parse(order.items),
            totalPrice: order.totalPrice,
            status: order.status,
            createdAt: order.createdAt,
            customerData: order.customerData ? JSON.parse(order.customerData) : null
        }));

        res.json({ orders: formattedOrders });
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
});

// Получить все заказы (для админа)
router.get('/all', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        // Проверяем роль пользователя
        const { UserModel } = require('../database/database');
        const user = await UserModel.findById(userId);
        if (!user || user.role !== 'Админ') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']]
        });

        // Получаем данные пользователей для каждого заказа
        const formattedOrders = await Promise.all(orders.map(async (order) => {
            const orderUser = await UserModel.findById(order.userId);
            return {
                id: order.id,
                userId: order.userId,
                user: orderUser ? { username: orderUser.username, email: orderUser.email } : null,
                items: JSON.parse(order.items),
                totalPrice: order.totalPrice,
                status: order.status,
                createdAt: order.createdAt,
                customerData: order.customerData ? JSON.parse(order.customerData) : null
            };
        }));

        res.json({ orders: formattedOrders });
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
});

// Обновить статус заказа (только для админа)
router.put('/:id/status', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        // Проверяем роль пользователя
        const { UserModel } = require('../database/database');
        const user = await UserModel.findById(userId);
        if (!user || user.role !== 'Админ') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['Собираем', 'В пути', 'Доставлен', 'Создаем кастомуную фигурку'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Неверный статус заказа' });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: 'Статус заказа обновлен' });
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
    }
});

module.exports = router;

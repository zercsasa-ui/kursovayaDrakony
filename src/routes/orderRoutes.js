const express = require('express');
const router = express.Router();
const { Order } = require('../models');
const { requireAuth } = require('../middleware/auth');

// Создать кастомный заказ
router.post('/custom', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        const { name, budget, description } = req.body;

        // Basic validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Название фигурки обязательно' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'Описание заказа обязательно' });
        }

        // Create custom order
        const customOrder = await Order.create({
            userId: userId,
            items: JSON.stringify([]), // Empty array for custom orders
            totalPrice: budget ? parseFloat(budget) : 0,
            status: 'Оценка работы',
            customOrderData: JSON.stringify({
                name: name.trim(),
                budget: budget ? parseFloat(budget) : null,
                description: description.trim()
            })
        });

        res.json({
            success: true,
            message: 'Кастомный заказ создан успешно',
            orderId: customOrder.id
        });
    } catch (error) {
        console.error('Ошибка при создании кастомного заказа:', error);
        res.status(500).json({ error: 'Ошибка при создании заказа' });
    }
});

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
            customerData: order.customerData ? JSON.parse(order.customerData) : null,
            customOrderData: order.customOrderData ? JSON.parse(order.customOrderData) : null,
            adminResponse: order.adminResponse ? JSON.parse(order.adminResponse) : null
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
                customerData: order.customerData ? JSON.parse(order.customerData) : null,
                customOrderData: order.customOrderData ? JSON.parse(order.customOrderData) : null,
                adminResponse: order.adminResponse ? JSON.parse(order.adminResponse) : null
            };
        }));

        res.json({ orders: formattedOrders });
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
});

// Получить конкретный заказ пользователя
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' });
        }

        const orderId = req.params.id;
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Проверяем, что заказ принадлежит пользователю или пользователь админ
        const { UserModel } = require('../database/database');
        const user = await UserModel.findById(userId);
        if (order.userId !== userId && (!user || user.role !== 'Админ')) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        // Преобразуем данные для клиента
        const formattedOrder = {
            id: order.id,
            items: JSON.parse(order.items),
            totalPrice: order.totalPrice,
            status: order.status,
            createdAt: order.createdAt,
            customerData: order.customerData ? JSON.parse(order.customerData) : null,
            customOrderData: order.customOrderData ? JSON.parse(order.customOrderData) : null,
            adminResponse: order.adminResponse ? JSON.parse(order.adminResponse) : null
        };

        res.json(formattedOrder);
    } catch (error) {
        console.error('Ошибка при получении заказа:', error);
        res.status(500).json({ error: 'Ошибка при получении заказа' });
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

        const { status, response } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['Собираем', 'В пути', 'Доставлен', 'Создаем кастомуную фигурку', 'Оценка работы', 'Согласование'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Неверный статус заказа' });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        order.status = status;
        if (response !== undefined) {
            order.adminResponse = response ? JSON.stringify({
                message: response.trim(),
                updatedAt: new Date().toISOString()
            }) : null;
        }
        await order.save();

        res.json({ success: true, message: 'Статус заказа обновлен' });
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
    }
});

// Обновить кастомный заказ (цена, ответ администратора и статус)
router.put('/:id/custom', requireAuth, async (req, res) => {
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

        const { totalPrice, response, status } = req.body;
        const orderId = req.params.id;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        if (!order.customOrderData) {
            return res.status(400).json({ error: 'Это не кастомный заказ' });
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['Оценка работы', 'Создаем кастомуную фигурку', 'В пути', 'Доставлен', 'Согласование'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Неверный статус заказа' });
            }
            order.status = status;
        }

        // Update price and response
        order.totalPrice = parseFloat(totalPrice) || order.totalPrice;
        order.adminResponse = response ? JSON.stringify({
            message: response.trim(),
            updatedAt: new Date().toISOString()
        }) : order.adminResponse;

        await order.save();

        res.json({
            success: true,
            message: 'Кастомный заказ обновлен успешно'
        });
    } catch (error) {
        console.error('Ошибка при обновлении кастомного заказа:', error);
        res.status(500).json({ error: 'Ошибка при обновлении кастомного заказа' });
    }
});

// Удалить заказ (только для админа)
router.delete('/:id', requireAuth, async (req, res) => {
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

        const orderId = req.params.id;
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        await order.destroy();

        res.json({ success: true, message: 'Заказ успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
        res.status(500).json({ error: 'Ошибка при удалении заказа' });
    }
});

module.exports = router;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import styles from './AdminPage.module.css';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [figurines, setFigurines] = useState([]);
    const [dolls, setDolls] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000); // Auto-hide after 3 seconds
    };

    const validateUserData = (userData) => {
        const errors = [];

        if (!userData.username || userData.username.trim().length < 3) {
            errors.push('Имя пользователя должно содержать минимум 3 символа');
        }

        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errors.push('Введите корректный email адрес');
        }

        // Password length validation removed
        // if (userData.password && userData.password.length < 6) {
        //     errors.push('Пароль должен содержать минимум 6 символов');
        // }

        const validRoles = ['Покупатель', 'Редактор', 'Админ'];
        if (!userData.role || !validRoles.includes(userData.role)) {
            errors.push('Выберите корректную роль');
        }

        return errors;
    };

    const validateProductData = (productData) => {
        const errors = [];

        if (!productData.name || productData.name.trim().length < 2) {
            errors.push('Название товара должно содержать минимум 2 символа');
        }

        if (!productData.price || isNaN(productData.price) || productData.price <= 0) {
            errors.push('Цена должна быть положительным числом');
        }

        if (productData.inStock !== undefined && (!/^\d+$/.test(String(productData.inStock)) || productData.inStock < 0)) {
            errors.push('Количество в наличии должно быть неотрицательным целым числом');
        }

        if (productData.popularity !== undefined && (!/^\d+$/.test(String(productData.popularity)) || productData.popularity < 0)) {
            errors.push('Популярность должна быть неотрицательным целым числом');
        }

        const validColors = ['', 'Красный', 'Черный', 'Разноцветный'];
        if (productData.color && !validColors.includes(productData.color)) {
            errors.push('Выберите корректный цвет');
        }

        return errors;
    };

    useEffect(() => {
        checkAuthAndFetchData();
    }, []);

    const checkAuthAndFetchData = async () => {
        try {
            // Check authentication and role
            const authResponse = await fetch('http://localhost:3000/api/auth/session', {
                credentials: 'include'
            });
            const authData = await authResponse.json();

            if (!authData.authenticated) {
                navigate('/login');
                return;
            }

            // Check user details
            const userResponse = await fetch('http://localhost:3000/api/auth/user', {
                credentials: 'include'
            });
            const userData = await userResponse.json();

            if (!userData.success || (userData.user.role !== 'Админ' && userData.user.role !== 'Редактор')) {
                navigate('/');
                return;
            }

            setCurrentUser(userData.user);
            setIsAuthorized(true);
            fetchData();
        } catch (error) {
            console.error('Auth check failed:', error);
            navigate('/login');
        }
    };

    const fetchData = async () => {
        try {
            const [usersResponse, figurinesResponse, dollsResponse, ordersResponse] = await Promise.all([
                fetch('http://localhost:3000/api/users', { credentials: 'include' }),
                fetch('http://localhost:3000/api/figurines', { credentials: 'include' }),
                fetch('http://localhost:3000/api/kykly', { credentials: 'include' }),
                fetch('http://localhost:3000/api/orders/all', { credentials: 'include' })
            ]);

            const usersData = await usersResponse.json();
            const figurinesData = await figurinesResponse.json();
            const dollsData = await dollsResponse.json();
            const ordersData = await ordersResponse.json();

            setUsers(usersData.users || []);
            setFigurines(figurinesData || []);
            setDolls(dollsData || []);
            setOrders(ordersData.orders || []);

            // Combine all products
            const allProducts = [
                ...figurinesData.map(f => ({ ...f, type: 'dragon', originalId: f.id })),
                ...dollsData.map(d => ({ ...d, type: 'doll', originalId: d.id }))
            ].sort((a, b) => a.id - b.id);

            setProducts(allProducts);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (userId) => {
        setEditingUser(userId);
    };

    const handleSaveUser = async (userId) => {
        const userRow = document.querySelector(`tr[data-user-id="${userId}"]`);

        const textInputs = userRow.querySelectorAll('input[type="text"]');
        const usernameInput = textInputs[0]; // username
        const passwordInput = textInputs[1]; // password
        const emailInput = userRow.querySelector('input[type="email"]');
        const roleSelect = userRow.querySelector('select');

        const userData = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            role: roleSelect.value,
            password: passwordInput && passwordInput.value.trim() ? passwordInput.value : undefined
        };

        const validationErrors = validateUserData(userData);
        if (validationErrors.length > 0) {
            showNotification(validationErrors.join('\n'), 'error');
            return;
        }

        const formData = new FormData();
        formData.append('username', userData.username);
        formData.append('email', userData.email);
        formData.append('role', userData.role);

        // Если пароль введен, добавляем его
        if (userData.password) {
            formData.append('password', userData.password);
        }

        // Если файл выбран, добавляем его
        const fileInput = userRow.querySelector('input[type="file"]');
        if (fileInput && fileInput.files[0]) {
            formData.append('avatar', fileInput.files[0]);
        }

        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                setEditingUser(null);
                fetchData(); // Refresh data
                showNotification('Пользователь обновлен успешно', 'success');
            } else {
                showNotification('Ошибка при обновлении пользователя', 'error');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showNotification('Ошибка при обновлении пользователя', 'error');
        }
    };

    const handleCancelUserEdit = () => {
        setEditingUser(null);
    };

    const handleEditFigurine = (figurineId) => {
        setEditingFigurine(figurineId);
    };

    const handleSaveFigurine = async (figurineId) => {
        const figurineRow = document.querySelector(`tr[data-figurine-id="${figurineId}"]`);

        const nameInput = figurineRow.querySelector('input[type="text"]'); // name
        const priceInput = figurineRow.querySelector('input[type="number"]');
        const colorInput = figurineRow.querySelectorAll('input[type="text"]')[1]; // color
        const descriptionTextarea = figurineRow.querySelectorAll('textarea')[0];
        const compositionTextarea = figurineRow.querySelectorAll('textarea')[1];

        // Collect raw values for validation
        const inputs = figurineRow.querySelectorAll('input');
        let inStockValue = '', popularityValue = '';

        if (inputs.length > 2) { // If there are more inputs, check for inStock and popularity
            const inStockInput = inputs[2];
            const popularityInput = inputs[3];
            inStockValue = inStockInput?.value || '';
            popularityValue = popularityInput?.value || '';
        }

        const rawProductData = {
            name: nameInput.value.trim(),
            price: priceInput.value,
            color: colorInput.value,
            inStock: inStockValue,
            popularity: popularityValue,
            description: descriptionTextarea.value.trim(),
            composition: compositionTextarea.value.trim()
        };

        // Validate with raw data first
        const validationData = {
            name: rawProductData.name,
            price: parseFloat(rawProductData.price),
            color: rawProductData.color,
            inStock: rawProductData.inStock,
            popularity: rawProductData.popularity,
            description: rawProductData.description,
            composition: rawProductData.composition
        };

        const validationErrors = validateProductData(validationData);
        if (validationErrors.length > 0) {
            showNotification(validationErrors.join('\n'), 'error');
            return;
        }

        // Convert to proper types for API call
        const formData = new FormData();
        formData.append('name', rawProductData.name);
        formData.append('price', parseFloat(rawProductData.price).toString());
        formData.append('color', rawProductData.color);
        formData.append('inStock', parseInt(rawProductData.inStock).toString());
        formData.append('popularity', parseInt(rawProductData.popularity).toString());
        formData.append('description', rawProductData.description);
        formData.append('composition', rawProductData.composition);

        // Если файл выбран, добавляем его
        const fileInput = figurineRow.querySelector('input[type="file"]');
        if (fileInput && fileInput.files[0]) {
            formData.append('imageUrl', fileInput.files[0]);
        }

        try {
            const response = await fetch(`http://localhost:3000/api/figurines/${figurineId}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                setEditingFigurine(null);
                fetchData(); // Refresh data
                showNotification('Товар обновлен успешно', 'success');
            } else {
                showNotification('Ошибка при обновлении товара', 'error');
            }
        } catch (error) {
            console.error('Error updating figurine:', error);
            showNotification('Ошибка при обновлении товара', 'error');
        }
    };

    const handleCancelFigurineEdit = () => {
        setEditingFigurine(null);
    };

    const handleEditProduct = (productId) => {
        setEditingProduct(productId);
    };

    const handleSaveProduct = async (productId, product) => {
        const productRow = document.querySelector(`tr[data-product-id="${productId}"]`);

        const inputs = productRow.querySelectorAll('input');
        const nameInput = inputs[0]; // name (text)
        const priceInput = inputs[1]; // price (number)
        const inStockInput = inputs[2]; // inStock (number)
        const popularityInput = inputs[3]; // popularity (number)
        const specialOfferInput = inputs[4]; // specialOffer (checkbox)
        const fileInput = inputs[5]; // image file

        const colorSelect = productRow.querySelector('select'); // color select
        const textareas = productRow.querySelectorAll('textarea');
        const descriptionTextarea = textareas[0];
        const compositionTextarea = textareas[1];

        // Collect raw values for validation
        const rawProductData = {
            name: nameInput.value.trim(),
            price: priceInput.value,
            color: colorSelect.value,
            inStock: inStockInput.value,
            popularity: popularityInput.value,
            specialOffer: specialOfferInput.checked,
            description: descriptionTextarea.value.trim(),
            composition: compositionTextarea.value.trim()
        };

        // Validate with raw data first
        const validationData = {
            name: rawProductData.name,
            price: parseFloat(rawProductData.price),
            color: rawProductData.color,
            inStock: rawProductData.inStock,
            popularity: rawProductData.popularity,
            specialOffer: rawProductData.specialOffer,
            description: rawProductData.description,
            composition: rawProductData.composition
        };

        const validationErrors = validateProductData(validationData);
        if (validationErrors.length > 0) {
            showNotification(validationErrors.join('\n'), 'error');
            return;
        }

        // Convert to proper types for API call
        const formData = new FormData();
        formData.append('name', rawProductData.name);
        formData.append('price', parseFloat(rawProductData.price).toString());
        formData.append('color', rawProductData.color);
        formData.append('inStock', parseInt(rawProductData.inStock).toString());
        formData.append('popularity', parseInt(rawProductData.popularity).toString());
        formData.append('specialOffer', rawProductData.specialOffer.toString());
        formData.append('description', rawProductData.description);
        formData.append('composition', rawProductData.composition);

        // Если файл выбран, добавляем его
        if (fileInput && fileInput.files[0]) {
            formData.append('imageUrl', fileInput.files[0]);
        }

        const apiEndpoint = product.type === 'doll' ? 'kykly' : product.type === 'props' ? 'props' : 'figurines';

        try {
            const response = await fetch(`http://localhost:3000/api/${apiEndpoint}/${product.originalId}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                setEditingProduct(null);
                fetchData(); // Refresh data
                showNotification('Товар обновлен успешно', 'success');
            } else {
                showNotification('Ошибка при обновлении товара', 'error');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('Ошибка при обновлении товара', 'error');
        }
    };

    const handleCancelProductEdit = () => {
        setEditingProduct(null);
    };

    const handleEditOrder = (orderId) => {
        setEditingOrder(orderId);
    };

    const handleSaveOrder = async (orderId) => {
        const orderRow = document.querySelector(`tr[data-order-id="${orderId}"]`);
        const statusSelect = orderRow.querySelector('select');
        const status = statusSelect.value;

        // Find the order to check if it's a custom order
        const order = orders.find(o => o.id === orderId);

        const validStatuses = ['Жду когда вернется', 'Ожидается', 'В наличии', 'Собираем', 'В пути', 'Доставлен', 'Создаем кастомуную фигурку', 'Оценка работы', 'Согласование'];
        if (!validStatuses.includes(status)) {
            showNotification('Неверный статус заказа', 'error');
            return;
        }

        try {
            if (order.customOrderData) {
                // Custom order - update price and response
                const priceInput = orderRow.querySelector('input[type="number"]');
                const responseTextarea = orderRow.querySelector('textarea');

                const totalPrice = priceInput ? parseFloat(priceInput.value) || 0 : 0;
                const response = responseTextarea ? responseTextarea.value.trim() : '';

                const response_custom = await fetch(`http://localhost:3000/api/orders/${orderId}/custom`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ totalPrice, response, status })
                });

                if (response_custom.ok) {
                    setEditingOrder(null);
                    fetchData(); // Refresh data
                    showNotification('Кастомный заказ обновлен успешно', 'success');
                } else {
                    showNotification('Ошибка при обновлении кастомного заказа', 'error');
                }
            } else {
                // Regular order - update status only
                const response_status = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status })
                });

                if (response_status.ok) {
                    setEditingOrder(null);
                    fetchData(); // Refresh data
                    showNotification('Статус заказа обновлен успешно', 'success');
                } else {
                    showNotification('Ошибка при обновлении статуса заказа', 'error');
                }
            }
        } catch (error) {
            console.error('Error updating order:', error);
            showNotification('Ошибка при обновлении заказа', 'error');
        }
    };

    const handleCancelOrderEdit = () => {
        setEditingOrder(null);
    };

    const handleDeleteUser = (userId) => {
        setDeleteTarget({ type: 'user', id: userId });
        setShowDeleteModal(true);
    };

    const handleDeleteProduct = (product) => {
        setDeleteTarget({ type: 'product', product });
        setShowDeleteModal(true);
    };

    const handleDeleteOrder = (orderId) => {
        setDeleteTarget({ type: 'order', id: orderId });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget || !deletePassword) return;

        try {
            // Verify admin password
            const verifyResponse = await fetch('http://localhost:3000/api/auth/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: deletePassword })
            });

            if (!verifyResponse.ok) {
                showNotification('Неверный пароль администратора', 'error');
                return;
            }

            let deleteResponse;
            if (deleteTarget.type === 'user') {
                deleteResponse = await fetch(`http://localhost:3000/api/users/${deleteTarget.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
            } else if (deleteTarget.type === 'product') {
                const apiEndpoint = deleteTarget.product.type === 'doll' ? 'kykly' : deleteTarget.product.type === 'props' ? 'props' : 'figurines';
                deleteResponse = await fetch(`http://localhost:3000/api/${apiEndpoint}/${deleteTarget.product.originalId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
            } else if (deleteTarget.type === 'order') {
                deleteResponse = await fetch(`http://localhost:3000/api/orders/${deleteTarget.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
            }

            if (deleteResponse.ok) {
                setShowDeleteModal(false);
                setDeleteTarget(null);
                setDeletePassword('');
                fetchData(); // Refresh data
                const successMessage = deleteTarget.type === 'user' ? 'Пользователь удален успешно' :
                                      deleteTarget.type === 'product' ? 'Товар удален успешно' :
                                      'Заказ удален успешно';
                showNotification(successMessage, 'success');
            } else {
                showNotification('Ошибка при удалении', 'error');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            showNotification('Ошибка при удалении', 'error');
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setDeletePassword('');
    };

    const [newFigurine, setNewFigurine] = useState({
        productType: 'dragon',
        name: '',
        price: '',
        color: 'Разноцветный',
        description: '',
        composition: '',
        inStock: '',
        popularity: '',
        specialOffer: false
    });
    const [creatingFigurine, setCreatingFigurine] = useState(false);

    const handleNewFigurineChange = (e) => {
        const { name, value } = e.target;
        setNewFigurine(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        const productData = {
            name: newFigurine.name.trim(),
            price: parseFloat(newFigurine.price),
            color: newFigurine.color,
            inStock: parseInt(newFigurine.inStock) || 0,
            popularity: parseInt(newFigurine.popularity) || 0,
            specialOffer: newFigurine.specialOffer,
            description: newFigurine.description.trim(),
            composition: newFigurine.composition.trim()
        };

        const validationErrors = validateProductData(productData);
        if (validationErrors.length > 0) {
            showNotification(validationErrors.join('\n'), 'error');
            return;
        }

        setCreatingFigurine(true);

        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('price', productData.price.toString());
        formData.append('color', productData.color);
        formData.append('description', productData.description);
        formData.append('composition', productData.composition);
        formData.append('inStock', productData.inStock.toString());
        formData.append('popularity', productData.popularity.toString());
        formData.append('specialOffer', productData.specialOffer.toString());

        // Handle image file
        const imageInput = document.querySelector('input[name="imageUrl"]');
        if (imageInput && imageInput.files[0]) {
            formData.append('imageUrl', imageInput.files[0]);
        }

        const apiEndpoint = newFigurine.productType === 'doll' ? 'kykly' : newFigurine.productType === 'props' ? 'props' : 'figurines';

        try {
            const response = await fetch(`http://localhost:3000/api/${apiEndpoint}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                setNewFigurine({
                    productType: 'dragon',
                    name: '',
                    price: '',
                    color: 'Разноцветный',
                    description: '',
                    composition: '',
                    inStock: '',
                    popularity: '',
                    specialOffer: false
                });
                // Clear file input
                if (imageInput) imageInput.value = '';
                fetchData(); // Refresh data
                showNotification('Товар создан успешно', 'success');
            } else {
                showNotification('Ошибка при создании товара', 'error');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification('Ошибка при создании товара', 'error');
        } finally {
            setCreatingFigurine(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.adminPage}>
                <HeaderBlock />
                <div className={styles.loading}>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <HeaderBlock />
            <div className={styles.content}>
                <h1>Админ Консоль</h1>

                {currentUser?.role === 'Админ' && (
                    <div className={styles.section}>
                        <h2>Пользователи</h2>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Имя пользователя</th>
                                        <th>Email</th>
                                        <th>Роль</th>
                                        <th>Пароль</th>
                                        <th>Аватар</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} data-user-id={user.id}>
                                            <td>{user.id}</td>
                                            <td>
                                                {editingUser === user.id ? (
                                                    <input type="text" defaultValue={user.username} />
                                                ) : (
                                                    user.username
                                                )}
                                            </td>
                                            <td>
                                                {editingUser === user.id ? (
                                                    <input type="email" defaultValue={user.email} />
                                                ) : (
                                                    user.email
                                                )}
                                            </td>
                                            <td>
                                                {editingUser === user.id ? (
                                                    <select defaultValue={user.role}>
                                                        <option value="Покупатель">Покупатель</option>
                                                        <option value="Редактор">Редактор</option>
                                                        <option value="Админ">Админ</option>
                                                    </select>
                                                ) : (
                                                    user.role
                                                )}
                                            </td>
                                            <td>
                                                {editingUser === user.id ? (
                                                    <input type="text" defaultValue={user.password} placeholder="Новый пароль (оставьте пустым чтобы не менять)" />
                                                ) : (
                                                    user.password
                                                )}
                                            </td>
                                            <td>
                                                {editingUser === user.id ? (
                                                    <input type="file" accept="image/*" className={styles.fileInput} />
                                                ) : (
                                                    user.avatar ? <img src={user.avatar} alt="avatar" className={styles.avatar} /> : 'Нет'
                                                )}
                                            </td>
                                            <td>
                                                {editingUser === user.id ? (
                                                    <div className={styles.actionButtons}>
                                                        <button onClick={() => handleSaveUser(user.id)} className={styles.saveButton}>Сохранить</button>
                                                        <button onClick={handleCancelUserEdit} className={styles.cancelButton}>Отмена</button>
                                                    </div>
                                                ) : (
                                                    <div className={styles.actionButtons}>
                                                        <button onClick={() => handleEditUser(user.id)} className={styles.editButton}>Редактировать</button>
                                                        {currentUser && currentUser.id !== user.id && (
                                                            <button onClick={() => handleDeleteUser(user.id)} className={styles.deleteButton}>Удалить</button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className={styles.section}>
                    <h2>Товары</h2>

                    <div className={styles.createForm}>
                        <h3>Создать новый товар</h3>
                        <form onSubmit={handleCreateProduct} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="productType">Тип товара</label>
                                <select
                                    id="productType"
                                    name="productType"
                                    value={newFigurine.productType || 'dragon'}
                                    onChange={handleNewFigurineChange}
                                    required
                                >
                                    <option value="dragon">Дракон</option>
                                    <option value="doll">Кукла</option>
                                    <option value="props">Проп</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="name">Название</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newFigurine.name}
                                    onChange={handleNewFigurineChange}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="price">Цена</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="0.01"
                                    value={newFigurine.price}
                                    onChange={handleNewFigurineChange}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="color">Цвет</label>
                                <select
                                    id="color"
                                    name="color"
                                    value={newFigurine.color || ''}
                                    onChange={handleNewFigurineChange}
                                >
                                    <option value="">Выберите цвет</option>
                                    <option value="Красный">Красный</option>
                                    <option value="Черный">Черный</option>
                                    <option value="Разноцветный">Разноцветный</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="description">Описание</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newFigurine.description}
                                    onChange={handleNewFigurineChange}
                                    rows="3"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="composition">Состав</label>
                                <textarea
                                    id="composition"
                                    name="composition"
                                    value={newFigurine.composition}
                                    onChange={handleNewFigurineChange}
                                    rows="3"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="inStock">В наличии</label>
                                <input
                                    type="number"
                                    id="inStock"
                                    name="inStock"
                                    min="0"
                                    value={newFigurine.inStock}
                                    onChange={handleNewFigurineChange}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="popularity">Популярность</label>
                                <input
                                    type="number"
                                    id="popularity"
                                    name="popularity"
                                    min="0"
                                    value={newFigurine.popularity}
                                    onChange={handleNewFigurineChange}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="specialOffer">Спецпредложение</label>
                                <input
                                    type="checkbox"
                                    id="specialOffer"
                                    name="specialOffer"
                                    checked={newFigurine.specialOffer}
                                    onChange={(e) => setNewFigurine(prev => ({
                                        ...prev,
                                        specialOffer: e.target.checked
                                    }))}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="imageUrl">Изображение</label>
                                <input
                                    type="file"
                                    id="imageUrl"
                                    name="imageUrl"
                                    accept="image/*"
                                    className={styles.fileInput}
                                />
                            </div>

                            <button type="submit" className={styles.createButton} disabled={creatingFigurine}>
                                {creatingFigurine ? 'Создание...' : 'Создать товар'}
                            </button>
                        </form>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Цена</th>
                                    <th>Цвет</th>
                                    <th>В наличии</th>
                                    <th>Популярность</th>
                                    <th>Спецпредложение</th>
                                    <th>Описание</th>
                                    <th>Состав</th>
                                    <th>Изображение</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={`${product.type}_${product.originalId}`} data-product-id={`${product.type}_${product.originalId}`}>
                                        <td>{product.originalId}</td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <input type="text" defaultValue={product.name} />
                                            ) : (
                                                product.name
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <input type="number" step="0.01" defaultValue={product.price} />
                                            ) : (
                                                product.price
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <select defaultValue={product.color || ''}>
                                                    <option value="">Не указан</option>
                                                    <option value="Красный">Красный</option>
                                                    <option value="Черный">Черный</option>
                                                    <option value="Разноцветный">Разноцветный</option>
                                                </select>
                                            ) : (
                                                product.color || 'Не указан'
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <input type="number" min="0" defaultValue={product.inStock || 0} />
                                            ) : (
                                                product.inStock || 0
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <input type="number" min="0" defaultValue={product.popularity || 0} />
                                            ) : (
                                                product.popularity || 0
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <input type="checkbox" defaultChecked={product.specialOffer || false} />
                                            ) : (
                                                product.specialOffer ? 'Да' : 'Нет'
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <textarea defaultValue={product.description} rows="3" />
                                            ) : (
                                                product.description
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <textarea defaultValue={product.composition} rows="3" />
                                            ) : (
                                                product.composition
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <input type="file" accept="image/*" className={styles.fileInput} />
                                            ) : (
                                                product.imageUrl ? <img src={product.imageUrl} alt={product.name} className={styles.productImage} /> : 'Нет'
                                            )}
                                        </td>
                                        <td>
                                            {editingProduct === `${product.type}_${product.originalId}` ? (
                                                <div className={styles.actionButtons}>
                                                    <button onClick={() => handleSaveProduct(`${product.type}_${product.originalId}`, product)} className={styles.saveButton}>Сохранить</button>
                                                    <button onClick={handleCancelProductEdit} className={styles.cancelButton}>Отмена</button>
                                                </div>
                                            ) : (
                                                <div className={styles.actionButtons}>
                                                    <button onClick={() => handleEditProduct(`${product.type}_${product.originalId}`)} className={styles.editButton}>Редактировать</button>
                                                    <button onClick={() => handleDeleteProduct(product)} className={styles.deleteButton}>Удалить</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>Обычные заказы</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Пользователь</th>
                                    <th>Email</th>
                                    <th>Товары</th>
                                    <th>Итого</th>
                                    <th>Статус</th>
                                    <th>Дата</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.filter(order => !order.customOrderData).map(order => (
                                    <tr key={order.id} data-order-id={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.user?.username || 'Неизвестен'}</td>
                                        <td>{order.user?.email || 'Неизвестен'}</td>
                                        <td>
                                            {(() => {
                                                try {
                                                    let items;
                                                    if (Array.isArray(order.items)) {
                                                        items = order.items;
                                                    } else if (typeof order.items === 'string') {
                                                        items = JSON.parse(order.items);
                                                    } else {
                                                        throw new Error('Invalid items format');
                                                    }
                                                    return items.map((item, index) => (
                                                        <div key={index}>
                                                            {item.name} x{item.quantity}
                                                        </div>
                                                    ));
                                                } catch (error) {
                                                    console.error('Error parsing order items:', error, order.items);
                                                    return <div>Ошибка данных</div>;
                                                }
                                            })()}
                                        </td>
                                        <td>{order.totalPrice} ₽</td>
                                        <td>
                                            {editingOrder === order.id ? (
                                                <select defaultValue={order.status}>
                                                    <option value="Жду когда вернется">Жду когда вернется</option>
                                                    <option value="Ожидается">Ожидается</option>
                                                    <option value="В наличии">В наличии</option>
                                                    <option value="Собираем">Собираем</option>
                                                    <option value="В пути">В пути</option>
                                                    <option value="Доставлен">Доставлен</option>
                                                    <option value="Создаем кастомуную фигурку">Создаем кастомуную фигурку</option>
                                                    <option value="Оценка работы">Оценка работы</option>
                                                    <option value="Согласование">Согласование</option>
                                                </select>
                                            ) : (
                                                order.status
                                            )}
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                                        <td>
                                            {editingOrder === order.id ? (
                                                <div className={styles.actionButtons}>
                                                    <button onClick={() => handleSaveOrder(order.id)} className={styles.saveButton}>Сохранить</button>
                                                    <button onClick={handleCancelOrderEdit} className={styles.cancelButton}>Отмена</button>
                                                </div>
                                            ) : (
                                                <div className={styles.actionButtons}>
                                                    <button onClick={() => handleEditOrder(order.id)} className={styles.editButton}>Изменить статус</button>
                                                    <button onClick={() => handleDeleteOrder(order.id)} className={styles.deleteButton}>Удалить</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>Кастомные заказы</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Пользователь</th>
                                    <th>Email</th>
                                    <th>Название фигурки</th>
                                    <th>Бюджет клиента</th>
                                    <th>Цена</th>
                                    <th>Ответ администратора</th>
                                    <th>Статус</th>
                                    <th>Дата</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.filter(order => order.customOrderData).map(order => (
                                    <tr key={order.id} data-order-id={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.user?.username || 'Неизвестен'}</td>
                                        <td>{order.user?.email || 'Неизвестен'}</td>
                                        <td>
                                            {(() => {
                                                const customData = typeof order.customOrderData === 'string'
                                                    ? JSON.parse(order.customOrderData)
                                                    : order.customOrderData;
                                                return customData.name;
                                            })()}
                                        </td>
                                        <td>
                                            {(() => {
                                                const customData = typeof order.customOrderData === 'string'
                                                    ? JSON.parse(order.customOrderData)
                                                    : order.customOrderData;
                                                return customData.budget ? `${customData.budget} ₽` : 'Не указан';
                                            })()}
                                        </td>
                                        <td>
                                            {editingOrder === order.id ? (
                                                <input
                                                    type="number"
                                                    defaultValue={order.totalPrice || ''}
                                                    placeholder="Цена"
                                                    style={{ width: '80px' }}
                                                />
                                            ) : (
                                                order.totalPrice ? `${order.totalPrice} ₽` : 'Не установлена'
                                            )}
                                        </td>
                                        <td>
                                            {editingOrder === order.id ? (
                                                <textarea
                                                    defaultValue={order.adminResponse ? (typeof order.adminResponse === 'string' ? JSON.parse(order.adminResponse).message : order.adminResponse.message) : ''}
                                                    placeholder="Ответ администратора"
                                                    rows="3"
                                                    style={{ width: '250px', resize: 'vertical' }}
                                                />
                                            ) : (
                                                order.adminResponse ? (
                                                    <div style={{
                                                        maxWidth: '250px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {typeof order.adminResponse === 'string'
                                                            ? JSON.parse(order.adminResponse).message
                                                            : order.adminResponse.message}
                                                    </div>
                                                ) : (
                                                    'Нет ответа'
                                                )
                                            )}
                                        </td>
                                        <td>
                                            {editingOrder === order.id ? (
                                                <select defaultValue={order.status}>
                                                    <option value="Оценка работы">Оценка работы</option>
                                                    <option value="Создаем кастомуную фигурку">Создаем кастомуную фигурку</option>
                                                    <option value="Согласование">Согласование</option>
                                                    <option value="В пути">В пути</option>
                                                    <option value="Доставлен">Доставлен</option>
                                                </select>
                                            ) : (
                                                order.status
                                            )}
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                                        <td>
                                            {editingOrder === order.id ? (
                                                <div className={styles.actionButtons}>
                                                    <button onClick={() => handleSaveOrder(order.id)} className={styles.saveButton}>Сохранить</button>
                                                    <button onClick={handleCancelOrderEdit} className={styles.cancelButton}>Отмена</button>
                                                </div>
                                            ) : (
                                                <div className={styles.actionButtons}>
                                                    <button onClick={() => handleEditOrder(order.id)} className={styles.editButton}>Редактировать</button>
                                                    <button onClick={() => handleDeleteOrder(order.id)} className={styles.deleteButton}>Удалить</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {currentUser?.role === 'Админ' && (
                    <div className={styles.section}>
                        <h2>Список API маршрутов</h2>
                        <div className={styles.apiList}>
                            <ul>
                                <li><strong>GET /api/products</strong> - Получить все товары</li>
                                <li><strong>GET /api/figurines</strong> - Получить все драконы</li>
                                <li><strong>POST /api/figurines</strong> - Создать нового дракона</li>
                                <li><strong>PUT /api/figurines/:id</strong> - Обновить дракона</li>
                                <li><strong>DELETE /api/figurines/:id</strong> - Удалить дракона</li>
                                <li><strong>GET /api/kykly</strong> - Получить все куклы</li>
                                <li><strong>POST /api/kykly</strong> - Создать новую куклу</li>
                                <li><strong>PUT /api/kykly/:id</strong> - Обновить куклу</li>
                                <li><strong>DELETE /api/kykly/:id</strong> - Удалить куклу</li>
                                <li><strong>GET /api/props</strong> - Получить все пропы</li>
                                <li><strong>POST /api/props</strong> - Создать новый проп</li>
                                <li><strong>PUT /api/props/:id</strong> - Обновить проп</li>
                                <li><strong>DELETE /api/props/:id</strong> - Удалить проп</li>
                                <li><strong>GET /api/navigate</strong> - Навигационные маршруты</li>
                                <li><strong>POST /api/auth/login</strong> - Авторизация</li>
                                <li><strong>POST /api/auth/logout</strong> - Выход</li>
                                <li><strong>GET /api/auth/session</strong> - Проверить сессию</li>
                                <li><strong>GET /api/auth/user</strong> - Получить данные пользователя</li>
                                <li><strong>GET /api/users</strong> - Получить всех пользователей</li>
                                <li><strong>PUT /api/users/:id</strong> - Обновить пользователя</li>
                                <li><strong>GET /api/orders</strong> - Получить заказы пользователя</li>
                                <li><strong>GET /api/orders/all</strong> - Получить все заказы (админ)</li>
                                <li><strong>PUT /api/orders/:id/status</strong> - Обновить статус заказа</li>
                                <li><strong>DELETE /api/orders/:id</strong> - Удалить заказ (админ)</li>
                                <li><strong>GET /debug/users</strong> - Отладка пользователей</li>
                            </ul>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>Подтверждение удаления</h3>
                            <p>Вы действительно хотите удалить {deleteTarget?.type === 'user' ? 'пользователя' : deleteTarget?.type === 'product' ? 'товар' : 'заказ'}?</p>
                            <p>Для подтверждения введите пароль администратора:</p>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Пароль администратора"
                                className={styles.passwordInput}
                            />
                            <div className={styles.modalButtons}>
                                <button onClick={confirmDelete} className={styles.confirmButton}>Удалить</button>
                                <button onClick={cancelDelete} className={styles.cancelButton}>Отмена</button>
                            </div>
                        </div>
                    </div>
                )}

                {notification.show && (
                    <div className={`${styles.notification} ${styles[notification.type]}`}>
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                            className={styles.closeButton}
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPage;

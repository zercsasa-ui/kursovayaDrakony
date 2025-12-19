import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import styles from './AdminPage.module.css';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [figurines, setFigurines] = useState([]);
    const [dolls, setDolls] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const navigate = useNavigate();

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

            if (!userData.success || userData.user.role !== 'Админ') {
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
            const [usersResponse, figurinesResponse, dollsResponse] = await Promise.all([
                fetch('http://localhost:3000/api/users', { credentials: 'include' }),
                fetch('http://localhost:3000/api/figurines', { credentials: 'include' }),
                fetch('http://localhost:3000/api/kykly', { credentials: 'include' })
            ]);

            const usersData = await usersResponse.json();
            const figurinesData = await figurinesResponse.json();
            const dollsData = await dollsResponse.json();

            setUsers(usersData.users || []);
            setFigurines(figurinesData || []);
            setDolls(dollsData || []);

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
        const fileInput = userRow.querySelector('input[type="file"]');

        const formData = new FormData();
        formData.append('username', usernameInput.value);
        formData.append('email', emailInput.value);
        formData.append('role', roleSelect.value);

        // Если пароль введен, добавляем его
        if (passwordInput && passwordInput.value.trim()) {
            formData.append('password', passwordInput.value);
        }

        // Если файл выбран, добавляем его
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
                alert('Пользователь обновлен успешно');
            } else {
                alert('Ошибка при обновлении пользователя');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Ошибка при обновлении пользователя');
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
        const fileInput = figurineRow.querySelector('input[type="file"]');

        const formData = new FormData();
        formData.append('name', nameInput.value);
        formData.append('price', priceInput.value);
        formData.append('color', colorInput.value);
        formData.append('description', descriptionTextarea.value);
        formData.append('composition', compositionTextarea.value);

        // Если файл выбран, добавляем его
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
                alert('Товар обновлен успешно');
            } else {
                alert('Ошибка при обновлении товара');
            }
        } catch (error) {
            console.error('Error updating figurine:', error);
            alert('Ошибка при обновлении товара');
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

        const formData = new FormData();
        formData.append('name', nameInput.value);
        formData.append('price', priceInput.value);
        formData.append('color', colorSelect.value);
        formData.append('inStock', inStockInput.value);
        formData.append('popularity', popularityInput.value);
        formData.append('specialOffer', specialOfferInput.checked);
        formData.append('description', descriptionTextarea.value);
        formData.append('composition', compositionTextarea.value);

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
                alert('Товар обновлен успешно');
            } else {
                alert('Ошибка при обновлении товара');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Ошибка при обновлении товара');
        }
    };

    const handleCancelProductEdit = () => {
        setEditingProduct(null);
    };

    const handleDeleteUser = (userId) => {
        setDeleteTarget({ type: 'user', id: userId });
        setShowDeleteModal(true);
    };

    const handleDeleteProduct = (product) => {
        setDeleteTarget({ type: 'product', product });
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
                alert('Неверный пароль администратора');
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
            }

            if (deleteResponse.ok) {
                setShowDeleteModal(false);
                setDeleteTarget(null);
                setDeletePassword('');
                fetchData(); // Refresh data
                alert(deleteTarget.type === 'user' ? 'Пользователь удален успешно' : 'Товар удален успешно');
            } else {
                alert('Ошибка при удалении');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Ошибка при удалении');
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
        color: '',
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
        setCreatingFigurine(true);

        const formData = new FormData();
        formData.append('name', newFigurine.name);
        formData.append('price', newFigurine.price);
        formData.append('color', newFigurine.color);
        formData.append('description', newFigurine.description);
        formData.append('composition', newFigurine.composition);
        formData.append('inStock', newFigurine.inStock);
        formData.append('popularity', newFigurine.popularity);
        formData.append('specialOffer', newFigurine.specialOffer);

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
                    color: '',
                    description: '',
                    composition: '',
                    inStock: '',
                    popularity: '',
                    specialOffer: false
                });
                // Clear file input
                if (imageInput) imageInput.value = '';
                fetchData(); // Refresh data
                alert('Товар создан успешно');
            } else {
                alert('Ошибка при создании товара');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Ошибка при создании товара');
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
                                    <option value="Цветной">Цветной</option>
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
                                                    <option value="Цветной">Цветной</option>
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
                            <li><strong>GET /debug/users</strong> - Отладка пользователей</li>
                        </ul>
                    </div>
                </div>

                {showDeleteModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>Подтверждение удаления</h3>
                            <p>Вы действительно хотите удалить {deleteTarget?.type === 'user' ? 'пользователя' : 'товар'}?</p>
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
            </div>
        </div>
    );
}

export default AdminPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import styles from './ProfilePage.module.css';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [notificationFading, setNotificationFading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthAndFetchUser();
    }, []);

    useEffect(() => {
        if (isAuthorized) {
            fetchOrders();
        }
    }, [isAuthorized]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            } else {
                console.error('Error fetching orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    // Auto-hide success notification after 3 seconds with fade-out animation
    useEffect(() => {
        if (showSuccessNotification && !notificationFading) {
            const timer = setTimeout(() => {
                setNotificationFading(true);
                // After animation completes, hide the notification
                setTimeout(() => {
                    setShowSuccessNotification(false);
                    setNotificationFading(false);
                }, 300); // Match CSS transition duration
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessNotification, notificationFading]);

    const checkAuthAndFetchUser = async () => {
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

            if (!userData.success) {
                navigate('/');
                return;
            }

            setUser(userData.user);
            setEditForm({
                username: userData.user.username,
                email: userData.user.email,
                password: '',
                confirmPassword: ''
            });
            setIsAuthorized(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        if (editForm.password !== editForm.confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('username', editForm.username);
            formData.append('email', editForm.email);
            if (editForm.password) {
                formData.append('password', editForm.password);
            }

            // Handle avatar upload if needed
            const avatarInput = document.querySelector('input[name="avatar"]');
            if (avatarInput && avatarInput.files[0]) {
                formData.append('avatar', avatarInput.files[0]);
            }

            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                // Refresh user data from server after successful update
                try {
                    const userResponse = await fetch('http://localhost:3000/api/auth/user', {
                        credentials: 'include'
                    });
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        if (userData.success) {
                            setUser(userData.user);
                            setEditForm({
                                username: userData.user.username,
                                email: userData.user.email,
                                password: '',
                                confirmPassword: ''
                            });
                        }
                    }
                } catch (refreshError) {
                    console.error('Error refreshing user data:', refreshError);
                }

                setIsEditing(false);
                setShowSuccessNotification(true);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Ошибка при обновлении профиля');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Ошибка при обновлении профиля');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditForm({
            username: user.username,
            email: user.email,
            password: '',
            confirmPassword: ''
        });
        setIsEditing(false);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            alert('Введите пароль для подтверждения');
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ password: deletePassword })
            });

            if (response.ok) {
                alert('Аккаунт успешно удален');
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Ошибка при удалении аккаунта');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Ошибка при удалении аккаунта');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setDeletePassword('');
        }
    };

    if (loading) {
        return (
            <div className={styles.profilePage}>
                <HeaderBlock />
                <div className={styles.loading}>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
            <HeaderBlock />
            <div className={styles.profileContainer}>
                <h1>Профиль пользователя</h1>
                {user && (
                    <div className={styles.profileInfo}>
                        <div className={styles.avatarSection}>
                            {isEditing ? (
                                <div className={styles.avatarEdit}>
                                    <img src={user.avatar || "/images/woman.png"} alt="Аватар" className={styles.avatar} />
                                    <div className={styles.fileInputContainer}>
                                        <input type="file" name="avatar" accept="image/*" id="avatar-upload" className={styles.fileInputHidden} />
                                        <label htmlFor="avatar-upload" className={styles.fileInputLabel}>
                                            Изменить аватар
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <img src={user.avatar || "/images/woman.png"} alt="Аватар" className={styles.avatar} />
                            )}
                        </div>
                        <div className={styles.infoSection}>
                            <div className={styles.infoGroup}>
                                <label>Имя пользователя</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={editForm.username}
                                        onChange={handleEditChange}
                                        className={styles.editInput}
                                    />
                                ) : (
                                    <div className={styles.infoValue}>{user.username}</div>
                                )}
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        className={styles.editInput}
                                    />
                                ) : (
                                    <div className={styles.infoValue}>{user.email}</div>
                                )}
                            </div>
                            {isEditing && (
                                <>
                                    <div className={styles.infoGroup}>
                                        <label>Новый пароль</label>
                                        <div className={styles.passwordContainer}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={editForm.password}
                                                onChange={handleEditChange}
                                                placeholder="Оставьте пустым, чтобы не менять"
                                                className={styles.editInput}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`${styles.passwordToggle} ${showPassword ? styles.eyeFlipped : ''}`}
                                            >
                                                <img src="/images/eyeIcon.png" alt="Показать/скрыть пароль" className={styles.eyeIcon} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.infoGroup}>
                                        <label>Подтверждение пароля</label>
                                        <div className={styles.passwordContainer}>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={editForm.confirmPassword}
                                                onChange={handleEditChange}
                                                className={styles.editInput}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className={`${styles.passwordToggle} ${showConfirmPassword ? styles.eyeFlipped : ''}`}
                                            >
                                                <img src="/images/eyeIcon.png" alt="Показать/скрыть пароль" className={styles.eyeIcon} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {user.role !== 'Покупатель' && (
                                <div className={styles.infoGroup}>
                                    <label>Роль</label>
                                    <div className={`${styles.infoValue} ${user.role === 'Админ' ? styles.adminRole : ''}`}>{user.role}</div>
                                </div>
                            )}
                        </div>
                        <div className={styles.buttonSection}>
                            {isEditing ? (
                                <div className={styles.editButtons}>
                                    <button onClick={handleSaveProfile} disabled={saving} className={styles.saveButton}>
                                        {saving ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                    <button onClick={handleCancelEdit} className={styles.cancelButton}>
                                        Отмена
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.actionButtons}>
                                    <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                                        Редактировать профиль
                                    </button>
                                    <button onClick={() => setShowDeleteModal(true)} className={styles.deleteButton}>
                                        Удалить аккаунт
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Order Status Block */}
                <div className={styles.ordersBlock}>
                    <h2>Статус заказа</h2>
                    {orders.length === 0 ? (
                        <p>У вас пока нет заказов.</p>
                    ) : (
                        <div className={styles.ordersList}>
                            {orders.map(order => (
                                <div key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderHeader}>
                                        <div className={styles.orderInfo}>
                                            <span className={styles.orderId}>Заказ #{order.id}</span>
                                            <span className={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <div className={`${styles.orderStatus} ${styles[order.status.replace(/\s+/g, '').toLowerCase()]}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className={styles.orderDetails}>
                                        {order.customOrderData ? (
                                            // Custom order display
                                            <div className={styles.customOrderDetails}>
                                                <h4>Кастомная фигурка:</h4>
                                                <div className={styles.customOrderInfo}>
                                                    <p><strong>Название:</strong> {order.customOrderData.name}</p>
                                                    {order.customOrderData.budget && (
                                                        <p><strong>Бюджет:</strong> {order.customOrderData.budget} ₽</p>
                                                    )}
                                                    <p><strong>Описание:</strong></p>
                                                    <div className={styles.customOrderDescription}>
                                                        {order.customOrderData.description}
                                                    </div>
                                                    {order.adminResponse && order.status === 'Согласование' && (
                                                        <div className={styles.adminResponse}>
                                                            <p><strong>Ответ администратора:</strong></p>
                                                            <div className={styles.adminResponseText}>
                                                                {typeof order.adminResponse === 'string'
                                                                    ? JSON.parse(order.adminResponse).message
                                                                    : order.adminResponse.message}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            // Regular order display
                                            <div className={styles.orderItems}>
                                                <h4>Купленные товары:</h4>
                                                <ul>
                                                    {order.items.map((item, index) => (
                                                        <li key={index}>
                                                            {item.name} x{item.quantity} - {item.price * item.quantity} ₽
                                                        </li>
                                                    ))}
                                                </ul>
                                                {order.adminResponse && order.status === 'Согласование' && (
                                                    <div className={styles.adminResponse}>
                                                        <p><strong>Ответ администратора:</strong></p>
                                                        <div className={styles.adminResponseText}>
                                                            {typeof order.adminResponse === 'string'
                                                                ? JSON.parse(order.adminResponse).message
                                                                : order.adminResponse.message}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className={styles.orderTotal}>
                                            {!(order.customOrderData && order.status === 'Оценка работы') && (
                                                <>
                                                    <strong>Итого: {order.totalPrice} ₽</strong>
                                                    {order.customOrderData && order.totalPrice && order.status === 'Согласование' && (
                                                        <button
                                                            onClick={() => navigate(`/buy?customOrderId=${order.id}`)}
                                                            className={styles.sendButton}
                                                        >
                                                            Оплатить
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {order.customOrderData && order.status === 'Оценка работы' && (
                                                <strong>Ожидание оценки стоимости</strong>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showSuccessNotification && (
                <div className={`${styles.successNotification} ${notificationFading ? styles.fading : ''}`}>
                    Профиль успешно обновлен
                </div>
            )}

            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Удаление аккаунта</h3>
                        <p>Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.</p>
                        <p>Введите ваш пароль для подтверждения:</p>
                        <div className={styles.modalPasswordContainer}>
                            <input
                                type={showModalPassword ? "text" : "password"}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Пароль"
                                className={styles.modalPasswordInput}
                            />
                            <button
                                type="button"
                                onClick={() => setShowModalPassword(!showModalPassword)}
                                className={`${styles.modalPasswordToggle} ${showModalPassword ? styles.eyeFlipped : ''}`}
                            >
                                <img src="/images/eyeIcon.png" alt="Показать/скрыть пароль" className={styles.eyeIcon} />
                            </button>
                        </div>
                        <div className={styles.modalButtons}>
                            <button onClick={handleDeleteAccount} disabled={deleting} className={styles.confirmDeleteButton}>
                                {deleting ? 'Удаление...' : 'Удалить аккаунт'}
                            </button>
                            <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }} className={styles.cancelDeleteButton}>
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;

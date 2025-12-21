import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import Breadcrumbs from '../../Components/Breadcrumbs/Breadcrumbs';
import styles from './BuyPage.module.css';

function BuyPage() {
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        emailOption: 'registered', // 'registered' or 'custom'
        customEmail: '',
        address: '',
        city: '',
        postalCode: ''
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get current user data first
        const getCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/user', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const userData = await response.json();
                    if (userData.success) {
                        setCurrentUser(userData.user);
                        setUserData(prev => ({
                            ...prev,
                            firstName: userData.user.username || '',
                            email: userData.user.email || ''
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();
    }, []);

    // Separate effect for cart checking to prevent interference with cart loading
    useEffect(() => {
        // Only redirect if cart is empty and we're not loading
        if (!loading && cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, loading, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmailOptionChange = (option) => {
        setUserData(prev => ({
            ...prev,
            emailOption: option
        }));
    };

    const handleProceedToPayment = () => {
        // Basic validation
        if (!userData.firstName.trim() || !userData.lastName.trim()) {
            alert('Пожалуйста, заполните имя и фамилию');
            return;
        }

        const finalEmail = userData.emailOption === 'registered' ? userData.email : userData.customEmail;
        if (!finalEmail || !finalEmail.includes('@')) {
            alert('Пожалуйста, укажите корректный email');
            return;
        }

        // Navigate to payment page
        navigate('/payment');
    };

    const totalPrice = getTotalPrice();

    if (loading) {
        return (
            <div className={styles.buyPage}>
                <HeaderBlock />
                <div className={styles.loading}>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles.buyPage}>
            <HeaderBlock />
            <Breadcrumbs />
            <main className={styles.mainContent}>
                <div className={styles.checkoutContainer}>
                    <h1 className={styles.pageTitle}>Оформление заказа</h1>

                    <div className={styles.checkoutGrid}>
                        {/* Left side - Order summary */}
                        <div className={styles.orderSummary}>
                            <h2 className={styles.sectionTitle}>Ваш заказ</h2>

                            <div className={styles.itemsList}>
                                {cartItems.map(item => (
                                    <div key={item.id} className={styles.orderItem}>
                                        <div className={styles.itemImage}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = '/images/default.png';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <h3 className={styles.itemName}>{item.name}</h3>
                                            <p className={styles.itemQuantity}>Количество: {item.quantity}</p>
                                            <p className={styles.itemPrice}>{item.price} ₽</p>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            {item.price * item.quantity} ₽
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.orderTotal}>
                                <div className={styles.totalRow}>
                                    <span className={styles.totalLabel}>Итого:</span>
                                    <span className={styles.totalPrice}>{totalPrice} ₽</span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Customer information form */}
                        <div className={styles.customerInfo}>
                            <h2 className={styles.sectionTitle}>Информация о покупателе</h2>

                            <form className={styles.checkoutForm}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="firstName">Имя *</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={userData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="lastName">Фамилия *</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={userData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">Телефон</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+7 (___) ___-__-__"
                                    />
                                </div>

                                {/* Email selection */}
                                <div className={styles.formGroup}>
                                    <label>Email для получения чека *</label>
                                    <div className={styles.emailOptions}>
                                        <label className={styles.radioOption}>
                                            <input
                                                type="radio"
                                                name="emailOption"
                                                value="registered"
                                                checked={userData.emailOption === 'registered'}
                                                onChange={() => handleEmailOptionChange('registered')}
                                            />
                                            <span className={styles.radioLabel}>
                                                Email регистрации: {userData.email || 'Не указан'}
                                            </span>
                                        </label>
                                        <label className={styles.radioOption}>
                                            <input
                                                type="radio"
                                                name="emailOption"
                                                value="custom"
                                                checked={userData.emailOption === 'custom'}
                                                onChange={() => handleEmailOptionChange('custom')}
                                            />
                                            <span className={styles.radioLabel}>Другой email</span>
                                        </label>
                                    </div>

                                    {userData.emailOption === 'custom' && (
                                        <div className={styles.customEmailContainer}>
                                            <input
                                                type="email"
                                                name="customEmail"
                                                value={userData.customEmail}
                                                onChange={handleInputChange}
                                                placeholder="your@email.com"
                                                className={styles.customEmailInput}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="city">Город</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={userData.city}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="postalCode">Индекс</label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={userData.postalCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="address">Адрес доставки</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={userData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Улица, дом, квартира"
                                    />
                                </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        className={styles.backButton}
                                        onClick={() => navigate('/cart')}
                                    >
                                        Вернуться в корзину
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.paymentButton}
                                        onClick={handleProceedToPayment}
                                    >
                                        Перейти к оплате
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default BuyPage;

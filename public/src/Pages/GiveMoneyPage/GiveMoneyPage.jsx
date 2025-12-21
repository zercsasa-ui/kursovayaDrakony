import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import Breadcrumbs from '../../Components/Breadcrumbs/Breadcrumbs';
import styles from './GiveMoneyPage.module.css';

function GiveMoneyPage() {
    const navigate = useNavigate();
    const { cartItems, getTotalPrice, clearCart, loadCart } = useCart();
    const [checking, setChecking] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [customOrderData, setCustomOrderData] = useState(null);

    useEffect(() => {
        loadCart();

        // Check if there's custom order data in localStorage
        const customOrder = localStorage.getItem('customOrderData');
        if (customOrder) {
            try {
                setCustomOrderData(JSON.parse(customOrder));
            } catch (error) {
                console.error('Error parsing custom order data:', error);
            }
        }
    }, [loadCart]);

    const handleCancel = () => {
        if (customOrderData) {
            navigate('/profile');
        } else {
            navigate('/cart');
        }
    };

    const generateReceipt = async () => {
        try {
            // Get customer data from localStorage
            const customerData = localStorage.getItem('customerData');
            let parsedCustomerData = null;
            if (customerData) {
                try {
                    parsedCustomerData = JSON.parse(customerData);
                } catch (error) {
                    console.error('Error parsing customer data from localStorage:', error);
                }
            }

            let receiptData;
            if (customOrderData) {
                // Custom order receipt
                receiptData = {
                    customOrder: customOrderData,
                    totalPrice: customOrderData.totalPrice,
                    customerData: parsedCustomerData
                };
            } else {
                // Regular cart receipt
                receiptData = {
                    cartItems: cartItems,
                    totalPrice: getTotalPrice(),
                    customerData: parsedCustomerData
                };
            }

            const response = await fetch('http://localhost:3000/api/receipts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(receiptData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Чек создан:', result.receiptPath);

                // Clear cart only for regular orders
                if (!customOrderData) {
                    clearCart();
                }

                // Clear localStorage data
                localStorage.removeItem('customerData');
                localStorage.removeItem('customOrderData');
            } else {
                const error = await response.json();
                console.error('Ошибка при создании чека:', error.error);
                alert('Ошибка при создании чека. Попробуйте еще раз.');
                return;
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса на создание чека:', error);
            alert('Ошибка при создании чека. Попробуйте еще раз.');
            return;
        }
    };

    const handleCheckPayment = async () => {
        setChecking(true);
        // Simulate payment check
        setTimeout(() => {
            setChecking(false);
            setShowSuccessModal(true);
        }, 2000);
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        generateReceipt();
        navigate('/');
    };

    return (
        <div className={styles.giveMoneyPage}>
            <HeaderBlock />
            <Breadcrumbs />
            <main className={styles.mainContent}>
                <div className={styles.paymentContainer}>
                    <h1 className={styles.pageTitle}>Оплата заказа</h1>

                    <div className={styles.paymentBlock}>
                        <div className={styles.qrSection}>
                            <h2>Отсканируйте QR-код для оплаты</h2>
                            <div className={styles.qrCode}>
                                <img
                                    src="/images/qrСode.svg"
                                    alt="QR код для оплаты"
                                    onError={(e) => {
                                        e.target.src = '/images/default.png';
                                    }}
                                />
                            </div>
                            <p className={styles.instructions}>
                                Отсканируйте QR-код в приложении вашего банка или используйте данные для перевода
                            </p>
                        </div>

                        <div className={styles.paymentDetails}>
                            <h3>Реквизиты для оплаты:</h3>
                            <div className={styles.details}>
                                <p><strong>Сумма:</strong> {customOrderData ? customOrderData.totalPrice : getTotalPrice()} ₽</p>
                                <p><strong>Получатель:</strong> ***</p>
                                <p><strong>ИНН:</strong> ***</p>
                                <p><strong>Номер карты:</strong> ***</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.cancelButton}
                            onClick={handleCancel}
                        >
                            Отмена
                        </button>
                        <button
                            className={styles.checkButton}
                            onClick={handleCheckPayment}
                            disabled={checking}
                        >
                            {checking ? 'Проверяем...' : 'Проверить оплату'}
                        </button>
                    </div>
                </div>

                {showSuccessModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.successModal}>
                            <div className={styles.modalHeader}>
                                <h3>Оплата успешна</h3>
                            </div>
                            <div className={styles.modalBody}>
                                <p>Ваш заказ успешно оплачен!</p>
                            </div>
                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={handleConfirmSuccess}
                                >
                                    Ок
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default GiveMoneyPage;

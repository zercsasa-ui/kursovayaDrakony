import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import Breadcrumbs from '../../Components/Breadcrumbs/Breadcrumbs';
import styles from './GiveMoneyPage.module.css';

function GiveMoneyPage() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    const handleCancel = () => {
        navigate('/cart');
    };

    const handleCheckPayment = async () => {
        setChecking(true);
        // Simulate payment check
        setTimeout(() => {
            setChecking(false);
            alert('Оплата не найдена. Попробуйте еще раз или свяжитесь с поддержкой.');
        }, 2000);
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
                                <p><strong>Сумма:</strong> 1500 ₽</p>
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
            </main>
        </div>
    );
}

export default GiveMoneyPage;

import { useState } from 'react';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import styles from './CatalogPage.module.css';
import FiltersBlock from './Components/FiltersBlock/FiltersBlock';
import StuffBlock from './Components/StuffBlock/StuffBlock';

function CatalogPage() {
    const [filters, setFilters] = useState({
        category: 'all',
        materials: [],
        maxPrice: null,
        colors: [],
        inStock: false,
        specialOffers: false
    });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (productName, type = 'success') => {
        let message;
        if (type === 'success') {
            message = `Товар "${productName}" добавлен в корзину!`;
        } else if (type === 'error') {
            message = productName;
        }
        setNotification({
            show: true,
            message: message,
            type: type
        });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    return (
        <>
            <div className={styles.catalogPage}>
                <HeaderBlock />
                <main>
                    <div className={styles.filtersLeft}>
                        <FiltersBlock setFilters={setFilters} />
                    </div>
                    <div className={styles.stuffRight}>
                        <StuffBlock filters={filters} setFilters={setFilters} onShowNotification={showNotification} />
                    </div>
                </main>
            </div>

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
        </>
    );
};

export default CatalogPage;

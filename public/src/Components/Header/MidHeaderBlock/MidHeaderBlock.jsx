import { useNavigate } from 'react-router-dom';
import styles from './MidHeaderBlock.module.css';
import SearchComponent from './Search/SearchComponent';

function MidHeaderBlock({ isBurger, closeBurger }) {
    const navigate = useNavigate();

    const handleNavigation = async (page) => {
        try {
            const response = await fetch(`/api/navigate/${page}`);
            const data = await response.json();

            if (data.success) {
                console.log(`Navigating to ${page} via server:`, data);
                navigate(data.route);
                if (closeBurger) closeBurger();
            } else {
                console.error('Navigation error:', data.error);
            }
        } catch (error) {
            console.error('Navigation request failed:', error);
        }
    };

    if (isBurger) {
        return (
            <div className={styles.burgerNav}>
                <button
                    className={styles.burgerNavButton}
                    onClick={() => handleNavigation('catalog')}
                >
                    КАТАЛОГ
                </button>
                <button
                    className={styles.burgerNavButton}
                    onClick={() => handleNavigation('gallery')}
                >
                    ГАЛЕРЕЯ
                </button>
            </div>
        );
    }

    return (
        <>
            <div className={ styles.midHeaderBlock }>
                <SearchComponent/>
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('catalog')}
                >
                    КАТАЛОГ
                </button>
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('gallery')}
                >
                    ГАЛЕРЕЯ
                </button>
            </div>
        </>
    );
}

export default MidHeaderBlock;

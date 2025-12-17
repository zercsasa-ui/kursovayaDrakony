import { useNavigate } from 'react-router-dom';
import styles from './MidHeaderBlock.module.css';
import SearchComponent from './Search/SearchComponent';

function MidHeaderBlock() {
    const navigate = useNavigate();

    const handleNavigation = async (page) => {
        try {
            const response = await fetch(`/api/navigate/${page}`);
            const data = await response.json();

            if (data.success) {
                console.log(`Navigating to ${page} via server:`, data);
                navigate(data.route);
            } else {
                console.error('Navigation error:', data.error);
            }
        } catch (error) {
            console.error('Navigation request failed:', error);
        }
    };

    return (
        <>
            <div className={ styles.midHeaderBlock }>
                <SearchComponent/>
                <button
                    className={styles.link}
                    onClick={() => handleNavigation('catalog')}
                >
                    <p>КАТАЛОГ</p>
                </button>
                <button
                    className={styles.link}
                    onClick={() => handleNavigation('gallery')}
                >
                    <p>ГАЛЕРЕЯ</p>
                </button>
            </div>
        </>
    );
}

export default MidHeaderBlock;

import styles from './LeftHeaderBlock.module.css';
import { useNavigate } from 'react-router-dom';

function LeftHeaderBlock() {
    const navigate = useNavigate();

    const handleGoHome = async () => {
        try {
            const response = await fetch('/api/navigate/main');
            const data = await response.json();

            if (data.success) {
                console.log('Navigating to main via server:', data);
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
            <nav className={styles.leftHeaderBlock}>
                <button
                    className={styles.textHome}
                    onClick={handleGoHome}
                >
                    НА ГЛАВНУЮ
                </button>
        </nav>
        </>
    );
}

export default LeftHeaderBlock;

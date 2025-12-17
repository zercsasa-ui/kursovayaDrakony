import styles from './RightHeaderBlock.module.css';
import { useNavigate } from 'react-router-dom';

function RightHeaderBlock() {
    const navigate = useNavigate();

    const handleRegistration = async () => {
        try {
            const response = await fetch('/api/navigate/register');
            const data = await response.json();

            if (data.success) {
                console.log('Navigating to registration via server:', data);
                navigate(data.route);
            } else {
                console.error('Navigation error:', data.error);
            }
        } catch (error) {
            console.error('Navigation request failed:', error);
        }
    };

    return (
        <div className={styles.rightHeaderBlock}>
            <button
                className={styles.registrationButton}
                onClick={handleRegistration}
            >
                РЕГИСТРАЦИЯ
            </button>
            <div className={styles.cartContainer}>
                <img src="/images/korzina.svg" alt="корзина" />
            </div>
        </div>
    );
}

export default RightHeaderBlock;

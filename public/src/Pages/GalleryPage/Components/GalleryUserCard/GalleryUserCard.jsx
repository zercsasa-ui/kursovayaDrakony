import { useState } from 'react';
import styles from './GalleryUserCard.module.css';

function GalleryUserCard({ user, imageHeight }) {
    const { username, role, avatar } = user;
    const [imageError, setImageError] = useState(false);

    // Обрезаем username до 15 символов
    const truncatedUsername = username && username.length > 15
        ? username.substring(0, 13) + '...'
        : username;

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className={styles.userCard} style={{ height: imageHeight || '280px' }}>
            <div className={styles.imageContainer}>
                {!imageError ? (
                    <img
                        src={avatar}
                        alt={username}
                        className={styles.userImage}
                        onError={handleImageError}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.fallbackImage}>
                        👤
                    </div>
                )}
            </div>

            <div className={styles.userInfo}>
                <h3 className={styles.username}>{truncatedUsername}</h3>
                <span className={styles.userRole}>{role}</span>
            </div>
        </div>
    );
}

export default GalleryUserCard;

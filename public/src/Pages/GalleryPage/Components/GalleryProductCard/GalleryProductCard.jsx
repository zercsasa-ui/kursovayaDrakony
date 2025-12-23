import { useState } from 'react';
import styles from './GalleryProductCard.module.css';

function GalleryProductCard({ product, imageHeight }) {
    const { name, imageUrl } = product;
    const [imageError, setImageError] = useState(false);

    // Обрезаем название до 20 символов
    const truncatedName = name && name.length > 20
        ? name.substring(0, 18) + '...'
        : name;

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className={styles.productCard} style={{ height: imageHeight || '280px' }}>
            <div className={styles.imageContainer}>
                {!imageError ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className={styles.productImage}
                        onError={handleImageError}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.fallbackImage}>
                        🦎
                    </div>
                )}
            </div>

            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{truncatedName}</h3>
            </div>
        </div>
    );
}

export default GalleryProductCard;

import { useState } from 'react';
import styles from './ProductCard.module.css';

function ProductCard({ product }) {
    const { name, price, description, image, id } = product;
    const [imageError, setImageError] = useState(false);

    // Обрезаем описание до 80 символов и добавляем троеточие
    const truncatedDescription = description && description.length > 80
        ? description.substring(0, 80) + '...'
        : description;

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.imageContainer}>
                {!imageError ? (
                    <img
                        src={image}
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
                <h3 className={styles.productName}>{name}</h3>
                <p className={styles.productDescription}>{truncatedDescription}</p>
                <div className={styles.productFooter}>
                    <span className={styles.productPrice}>{price} ₽</span>
                    <button className={styles.addToCartBtn}>
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;

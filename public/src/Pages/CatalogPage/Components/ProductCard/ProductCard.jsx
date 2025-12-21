import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../../context/CartContext';
import styles from './ProductCard.module.css';

function ProductCard({ product, onShowNotification, onRefreshProducts }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { name, price, description, image, id, type, color, inStock, popularity, specialOffer, composition } = product;
    const [imageError, setImageError] = useState(false);

    // Обрезаем описание до 80 символов и добавляем троеточие
    const truncatedDescription = description && description.length > 80
        ? description.substring(0, 50) + '...'
        : description;

    // Обрезаем название до 20 символов
    const truncatedName = name && name.length > 20
        ? name.substring(0, 18) + '...'
        : name;

    // Обрезаем цену до 7 символов (включая ₽)
    const priceString = price + ' ₽';
    const truncatedPrice = priceString.length > 7
        ? priceString.substring(0, 12)
        : priceString;

    const handleImageError = () => {
        setImageError(true);
    };

    const handleCardClick = () => {
        navigate('/product', { state: { product } });
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        const result = await addToCart(product);
        if (result.success) {
            onShowNotification && onShowNotification(truncatedName, 'success');
            // Refresh products to show updated inventory in real-time
            onRefreshProducts && onRefreshProducts();
            console.log('Товар добавлен в корзину:', product.name);
        } else {
            let message = 'Произошла ошибка';
            if (result.error === 'not_authenticated') {
                message = 'Для начала авторизуйтесь';
            } else if (result.error === 'out_of_stock') {
                message = 'Товара нет в наличии';
            } else if (result.error === 'loading') {
                message = 'Подождите, выполняется другая операция';
            } else if (result.error === 'too_fast') {
                message = 'Подождите перед повторным добавлением';
            } else if (result.error === 'network') {
                message = 'Ошибка сети, попробуйте еще раз';
            }
            onShowNotification && onShowNotification(message, 'error');
            console.log('Не удалось добавить товар в корзину:', product.name, 'Ошибка:', result.error);
        }
    };

    return (
        <div className={styles.productCard} onClick={handleCardClick}>
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
                {inStock === 0 && (
                    <div className={styles.outOfStockOverlay}>
                        <span className={styles.outOfStockText}>Товар отсутствует</span>
                    </div>
                )}
            </div>

            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{truncatedName}</h3>
                <p className={styles.productDescription}>{truncatedDescription}</p>

                <div className={styles.productDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Тип:</span>
                        <span className={styles.detailValue}>
                            {type === 'dragon' ? 'Дракон' : type === 'doll' ? 'Кукла' : 'Реквизит'}
                        </span>
                    </div>
                    {color && (
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Цвет:</span>
                            <span className={styles.detailValue}>{color}</span>
                        </div>
                    )}
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>В наличии:</span>
                        <span className={styles.detailValue}>{inStock} шт.</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Уже купили:</span>
                        <span className={styles.detailValue}>{popularity} шт.</span>
                    </div>
                    {specialOffer && (
                        <div className={styles.specialOffer}>
                            <span className={styles.specialOfferText}>СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ</span>
                        </div>
                    )}
                </div>

                <div className={styles.productFooter}>
                    <span className={styles.productPrice}>{truncatedPrice}</span>
                    <button
                        className={styles.addToCartBtn}
                        onClick={handleAddToCart}
                    >
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;

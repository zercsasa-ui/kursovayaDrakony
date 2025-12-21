import { useState, useEffect } from 'react';
import styles from './LatestPublicationBlock.module.css';

function LatestPublicationBlock() {
    const [latestProduct, setLatestProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestProduct = async () => {
            try {
                const response = await fetch('/api/products/latest');
                if (!response.ok) {
                    throw new Error('Failed to fetch latest product');
                }
                const product = await response.json();
                setLatestProduct(product);
            } catch (err) {
                console.error('Error fetching latest product:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestProduct();
    }, []);

    if (loading) {
        return (
            <div className={styles.latestPublicationBg}>
                <div className={styles.latestPublication}>
                    <div className={styles.loading}>Загрузка...</div>
                </div>
            </div>
        );
    }

    if (error || !latestProduct) {
        return null; // Не показывать блок если ошибка или нет товара
    }

    return (
        <div className={styles.latestPublicationBg}>
            <div className={styles.latestPublication}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.title}>Последняя публикация</h2>
                    <p className={styles.subtitle}>
                        Самый свежий товар в нашей коллекции
                    </p>
                </div>
                <div className={styles.featuredCard}>
                    <div className={styles.imageContainer}>
                        <img
                            src={latestProduct.imageUrl || '/images/default-product.png'}
                            alt={latestProduct.name}
                            className={styles.productImage}
                            onError={(e) => {
                                e.target.src = '/images/default-product.png';
                            }}
                        />
                    </div>
                    <div className={styles.infoContainer}>
                        <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{latestProduct.name}</h3>
                            <p className={styles.productDescription}>{latestProduct.description}</p>
                            <div className={styles.productDetails}>
                                {latestProduct.price && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Цена:</span>
                                        <span className={styles.detailValue}>{latestProduct.price} руб.</span>
                                    </div>
                                )}
                                {latestProduct.color && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Цвет:</span>
                                        <span className={styles.detailValue}>{latestProduct.color}</span>
                                    </div>
                                )}
                                {latestProduct.composition && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Состав:</span>
                                        <span className={styles.detailValue}>{latestProduct.composition}</span>
                                    </div>
                                )}
                                {latestProduct.inStock !== null && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>В наличии:</span>
                                        <span className={styles.detailValue}>{latestProduct.inStock} шт.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LatestPublicationBlock;

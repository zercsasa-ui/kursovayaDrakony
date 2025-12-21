import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import ProductCard from '../CatalogPage/Components/ProductCard/ProductCard';
import { useCart } from '../../context/CartContext';
import styles from './PageOfSelectProduct.module.css';

function PageOfSelectProduct() {
    const location = useLocation();
    const { addToCart } = useCart();
    const product = location.state?.product;
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [currentProduct, setCurrentProduct] = useState(product);
    const lastRefresh = useRef(0);

    const showNotification = (message, type = 'success') => {
        let fullMessage;
        if (type === 'success') {
            fullMessage = `Товар "${message}" добавлен в корзину!`;
        } else if (type === 'error') {
            fullMessage = message;
        }
        setNotification({
            show: true,
            message: fullMessage,
            type: type
        });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Function to refresh product data
    const refreshProductData = async () => {
        if (!product) return;
        if (Date.now() - lastRefresh.current < 3000) {
            return;
        }
        lastRefresh.current = Date.now();

        try {
            // Refresh main product data
            const apiInfo = getProductApiInfo(product.displayId);
            if (apiInfo) {
                const response = await fetch(`http://localhost:3000/api/${apiInfo.apiEndpoint}/${apiInfo.id}`);
                if (response.ok) {
                    const updatedProduct = await response.json();
                    const formattedProduct = {
                        id: updatedProduct.id, // Числовой ID для API
                        displayId: `${updatedProduct.type}_${updatedProduct.id}`, // Для отображения и ключей
                        name: updatedProduct.name,
                        price: parseFloat(updatedProduct.price) || 0,
                        description: updatedProduct.description || '',
                        image: updatedProduct.imageUrl || '/images/default.png',
                        color: updatedProduct.color || '',
                        type: updatedProduct.type,
                        inStock: updatedProduct.inStock || 0,
                        popularity: updatedProduct.popularity || 0,
                        specialOffer: updatedProduct.specialOffer || false,
                        composition: updatedProduct.composition || ''
                    };
                    setCurrentProduct(formattedProduct);
                }
            }

            // Refresh similar products
            const response = await fetch('/api/products');
            if (response.ok) {
                const allProductsData = await response.json();
                const formattedProducts = allProductsData.map(p => ({
                    id: p.id, // Числовой ID для API
                    displayId: `${p.type}_${p.id}`, // Для отображения и ключей
                    name: p.name,
                    price: parseFloat(p.price) || 0,
                    description: p.description || '',
                    image: p.imageUrl || '/images/default.png',
                    color: p.color || '',
                    type: p.type,
                    inStock: p.inStock || 0,
                    popularity: p.popularity || 0,
                    specialOffer: p.specialOffer || false,
                    composition: p.composition || ''
                }));

                const currentProductId = typeof product.id === 'string' ? parseInt(product.id.split('_')[1]) : product.id;
                const similar = formattedProducts
                    .filter(p => p.type === product.type && p.id !== currentProductId)
                    .sort((a, b) => b.displayId.localeCompare(a.displayId))
                    .slice(0, 3);
                setSimilarProducts(similar);
            }
        } catch (err) {
            console.error('Error refreshing product data:', err);
        }
    };

    // Helper function to parse product ID and get API endpoint
    const getProductApiInfo = (productId) => {
        if (typeof productId !== 'string' || !productId.includes('_')) return null;
        const parts = productId.split('_');
        if (parts.length !== 2) return null;

        const type = parts[0];
        const id = parts[1];

        let apiEndpoint;
        if (type === 'dragon') apiEndpoint = 'figurines';
        else if (type === 'doll') apiEndpoint = 'kykly';
        else if (type === 'props') apiEndpoint = 'props';
        else return null;

        return { apiEndpoint, id };
    };

    useEffect(() => {
        if (product) {
            const fetchSimilarProducts = async () => {
                try {
                    const response = await fetch('/api/products');
                    if (!response.ok) {
                        throw new Error('Failed to fetch products');
                    }
                    const allProductsData = await response.json();
                    const formattedProducts = allProductsData.map(p => ({
                        id: p.id, // Числовой ID для API
                        displayId: `${p.type}_${p.id}`, // Для отображения и ключей
                        name: p.name,
                        price: parseFloat(p.price) || 0,
                        description: p.description || '',
                        image: p.imageUrl || '/images/default.png',
                        color: p.color || '',
                        type: p.type,
                        inStock: p.inStock || 0,
                        popularity: p.popularity || 0,
                        specialOffer: p.specialOffer || false,
                        composition: p.composition || ''
                    }));
                    // Фильтруем по типу, исключаем текущий продукт, сортируем по displayId desc
                    const currentProductId = typeof product.id === 'string' ? parseInt(product.id.split('_')[1]) : product.id;
                    const similar = formattedProducts
                        .filter(p => p.type === product.type && p.id !== currentProductId)
                        .sort((a, b) => b.displayId.localeCompare(a.displayId))
                        .slice(0, 3);
                    setSimilarProducts(similar);
                } catch (err) {
                    console.error('Error fetching similar products:', err);
                } finally {
                    setLoadingSimilar(false);
                }
            };
            fetchSimilarProducts();
        }
    }, [product]);

    if (!product) {
        return (
            <div className={styles.pageContainer}>
                <HeaderBlock />
                <main className={styles.mainContent}>
                    <div className={styles.errorMessage}>
                        Товар не найден
                    </div>
                </main>
            </div>
        );
    }

    const displayProduct = currentProduct || product;
    const { name, price, description, image, id, type, color, inStock, popularity, specialOffer, composition } = displayProduct;

    const handleAddToCart = async () => {
        const result = await addToCart(displayProduct);
        if (result.success) {
            // Instantly update local state to show reduced inventory
            setCurrentProduct(prev => prev ? { ...prev, inStock: Math.max(0, prev.inStock - 1) } : prev);
            showNotification(displayProduct.name, 'success');
            // Refresh product data to show updated inventory from server
            await refreshProductData();
            console.log('Товар добавлен в корзину:', displayProduct.name);
        } else {
            let message = 'Необходимо авторизоваться';
            if (result.error === 'out_of_stock') {
                message = 'Товара нет в наличии';
            } else if (result.error === 'loading') {
                message = 'Подождите, выполняется другая операция';
            } else if (result.error === 'too_fast') {
                message = 'Подождите перед повторным добавлением';
            } else if (result.error === 'network') {
                message = 'Ошибка сети, попробуйте еще раз';
            }
            showNotification(message, 'error');
            console.log('Не удалось добавить товар в корзину:', displayProduct.name, 'Ошибка:', result.error);
        }
    };

    const handleOrder = () => {
        // Пока без функционала
        console.log('Заказать:', product);
    };

    return (
        <div className={styles.pageContainer}>
            <HeaderBlock />
            <main className={styles.mainContent}>
                <div className={styles.productContainer}>
                    <div className={styles.imageSection}>
                        <img
                            src={image}
                            alt={name}
                            className={styles.productImage}
                            onError={(e) => {
                                e.target.src = '/images/default.png';
                            }}
                        />
                    </div>

                    <div className={styles.infoSection}>
                        <h1 className={styles.productName}>{name}</h1>
                        <div className={styles.priceSection}>
                            <span className={styles.price}>{price} ₽</span>
                            {specialOffer && (
                                <span className={styles.specialOfferBadge}>СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ</span>
                            )}
                        </div>

                        <div className={styles.description}>
                            <h3>Описание:</h3>
                            <p>{description}</p>
                        </div>

                        <div className={styles.characteristics}>
                            <h3>Характеристики:</h3>
                            <div className={styles.characteristicsGrid}>
                                <div className={styles.characteristic}>
                                    <span className={styles.label}>Тип:</span>
                                    <span className={styles.value}>
                                        {type === 'dragon' ? 'Дракон' : type === 'doll' ? 'Кукла' : 'Реквизит'}
                                    </span>
                                </div>
                                {color && (
                                    <div className={styles.characteristic}>
                                        <span className={styles.label}>Цвет:</span>
                                        <span className={styles.value}>{color}</span>
                                    </div>
                                )}
                                <div className={styles.characteristic}>
                                    <span className={styles.label}>В наличии:</span>
                                    <span className={styles.value}>{inStock} шт.</span>
                                </div>
                                <div className={styles.characteristic}>
                                    <span className={styles.label}>Уже купили:</span>
                                    <span className={styles.value}>{popularity} шт.</span>
                                </div>
                                {composition && (
                                    <div className={styles.characteristic}>
                                        <span className={styles.label}>Состав:</span>
                                        <span className={styles.value}>{composition}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.addToCartBtn}
                                onClick={handleAddToCart}
                            >
                                В корзину
                            </button>
                            <button
                                className={styles.orderBtn}
                                onClick={handleOrder}
                            >
                                Заказать
                            </button>
                        </div>
                    </div>
                </div>

                {/* Секция похожих товаров */}
                <div className={styles.similarSection}>
                    <h2 className={styles.similarTitle}>Похожее</h2>
                    {loadingSimilar ? (
                        <div className={styles.loadingSimilar}>Загрузка похожих товаров...</div>
                    ) : similarProducts.length > 0 ? (
                        <div className={styles.similarProducts}>
                            {similarProducts.map(product => (
                                <ProductCard key={product.id} product={product} onShowNotification={showNotification} onRefreshProducts={refreshProductData} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noSimilar}>Нет похожих товаров</div>
                    )}
                </div>
            </main>

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
        </div>
    );
}

export default PageOfSelectProduct;

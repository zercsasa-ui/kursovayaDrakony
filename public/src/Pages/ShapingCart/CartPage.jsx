import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import Breadcrumbs from '../../Components/Breadcrumbs/Breadcrumbs';
import styles from './CartPage.module.css';

function CartPage() {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, loadCart } = useCart();
    const hasLoadedRef = useRef(false);

    // Принудительно перезагружаем корзину при открытии страницы (только один раз)
    useEffect(() => {
        if (!hasLoadedRef.current) {
            loadCart();
            hasLoadedRef.current = true;
        }
    }, []); // Пустой массив зависимостей - только при монтировании
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity <= 0) {
            const item = cartItems.find(item => item.id === productId);
            setItemToRemove(item);
            setShowConfirmModal(true);
        } else {
            await updateQuantity(productId, newQuantity);
        }
    };

    const handleRemoveItem = (productId) => {
        const item = cartItems.find(item => item.id === productId);
        setItemToRemove(item);
        setShowConfirmModal(true);
    };

    const confirmRemoveItem = async () => {
        if (itemToRemove) {
            await removeFromCart(itemToRemove.id);
            if (selectedProduct && selectedProduct.id === itemToRemove.id) {
                setSelectedProduct(null);
            }
        }
        setShowConfirmModal(false);
        setItemToRemove(null);
    };

    const cancelRemoveItem = () => {
        setShowConfirmModal(false);
        setItemToRemove(null);
    };

    const handleBuy = () => {
        navigate('/buy');
    };

    return (
        <div className={styles.cartPage}>
            <HeaderBlock />
            <Breadcrumbs />
            <main className={styles.mainContent}>
                <div className={styles.cartContainer}>
                    <div className={styles.cartList}>
                        <h2 className={styles.cartTitle}>Корзина</h2>
                        {cartItems.length === 0 ? (
                            <div className={styles.emptyCart}>
                                <p>Ваша корзина пуста</p>
                            </div>
                        ) : (
                            <div className={styles.itemsList}>
                                {cartItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`${styles.cartItem} ${selectedProduct && selectedProduct.id === item.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedProduct(item)}
                                    >
                                        <div className={styles.itemImage}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = '/images/default.png';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <h3 className={styles.itemName}>{item.name}</h3>
                                            <p className={styles.itemPrice}>{item.price} ₽</p>
                                            <div className={styles.quantityControls}>
                                                <button
                                                    className={styles.quantityBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuantityChange(item.id, item.quantity - 1);
                                                    }}
                                                >
                                                    -
                                                </button>
                                                <span className={styles.quantity}>{item.quantity}</span>
                                                <button
                                                    className={styles.quantityBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuantityChange(item.id, item.quantity + 1);
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveItem(item.id);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {cartItems.length > 0 && (
                            <div className={styles.cartFooter}>
                                <div className={styles.total}>
                                    <span>Итого: {getTotalPrice()} ₽</span>
                                </div>
                                <button
                                    className={styles.buyBtn}
                                    onClick={handleBuy}
                                >
                                    Купить
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.productDetails}>
                        {selectedProduct ? (
                            <div className={styles.detailsContent}>
                                <div className={styles.detailsImage}>
                                    <img
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
                                        onError={(e) => {
                                            e.target.src = '/images/default.png';
                                        }}
                                    />
                                </div>
                                <div className={styles.detailsInfo}>
                                    <h3>{selectedProduct.name}</h3>
                                    <p className={styles.detailsPrice}>{selectedProduct.price} ₽</p>

                                    <div className={styles.detailsSection}>
                                        <h4>Описание:</h4>
                                        <p>{selectedProduct.description}</p>
                                    </div>

                                    <div className={styles.detailsSection}>
                                        <h4>Характеристики:</h4>
                                        <div className={styles.characteristics}>
                                            <div className={styles.characteristic}>
                                                <span className={styles.label}>Тип:</span>
                                                <span className={styles.value}>
                                                    {selectedProduct.type === 'dragon' ? 'Дракон' : selectedProduct.type === 'doll' ? 'Кукла' : 'Реквизит'}
                                                </span>
                                            </div>
                                            {selectedProduct.color && (
                                                <div className={styles.characteristic}>
                                                    <span className={styles.label}>Цвет:</span>
                                                    <span className={styles.value}>{selectedProduct.color}</span>
                                                </div>
                                            )}
                                            <div className={styles.characteristic}>
                                                <span className={styles.label}>В наличии:</span>
                                                <span className={styles.value}>{selectedProduct.inStock} шт.</span>
                                            </div>
                                            {selectedProduct.composition && (
                                                <div className={styles.characteristic}>
                                                    <span className={styles.label}>Состав:</span>
                                                    <span className={styles.value}>{selectedProduct.composition}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noSelection}>
                                <p>Выберите товар из списка, чтобы посмотреть детали</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.confirmModal}>
                        <div className={styles.modalHeader}>
                            <h3>Подтверждение удаления</h3>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Вы точно хотите удалить "{itemToRemove?.name}" из корзины?</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={cancelRemoveItem}>
                                Отмена
                            </button>
                            <button className={styles.confirmBtn} onClick={confirmRemoveItem}>
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;

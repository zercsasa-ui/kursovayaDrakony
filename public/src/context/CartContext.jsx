import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const lastAddTime = useRef(0);

    // Load cart from API on mount
    const loadCart = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                credentials: 'include',
            });

            if (response.ok) {
                const items = await response.json();
                setCartItems(items);
            } else if (response.status === 401) {
                // User not authenticated, cart is empty
                setCartItems([]);
            } else {
                const errorText = await response.text();
                console.error('Failed to load cart:', errorText);
                setCartItems([]);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
        }
    };

    // Не загружаем корзину автоматически при монтировании компонента
    // Загрузка будет происходить только при открытии страниц, где нужна корзина

    const addToCart = async (product, quantity = 1) => {
        if (isLoading) {
            return { success: false, error: 'loading' };
        }

        // Throttle add to cart to 0.5 seconds
        if (Date.now() - lastAddTime.current < 500) {
            return { success: false, error: 'too_fast' };
        }

        // Проверяем локально, достаточно ли товара
        if (product.inStock < quantity) {
            return { success: false, error: 'out_of_stock' };
        }

        lastAddTime.current = Date.now();
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ productId: product.id, quantity }),
            });

            if (response.ok) {
                const result = await response.json();
                return { success: true };
            } else {
                const error = await response.json();
                console.error('Failed to add to cart:', error.error);
                if (response.status === 401) {
                    return { success: false, error: 'not_authenticated' };
                } else if (response.status === 400 && error.error === 'Недостаточно товара на складе') {
                    return { success: false, error: 'out_of_stock' };
                } else {
                    return { success: false, error: 'unknown' };
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: 'network' };
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/cart/${productId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                await loadCart(); // Reload cart after removing
            } else {
                console.error('Failed to remove from cart:', await response.text());
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (isLoading) return;

        if (newQuantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (response.ok) {
                await loadCart(); // Reload cart after updating
            } else {
                console.error('Failed to update cart quantity:', await response.text());
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setCartItems([]);
            } else {
                console.error('Failed to clear cart:', await response.text());
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        loadCart // Export loadCart for manual reloading
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};


import { useState, useEffect, useRef } from 'react';
import Category from './Components/Category/Category';
import FilterLine from './Components/FilterLine/FilterLine';
import ProductCard from '../ProductCard/ProductCard';
import styles from './StuffBlock.module.css';

function StuffBlock({ filters, setFilters, onShowNotification }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState(null); // 'popularity', 'price', or null
    const [sortOrder, setSortOrder] = useState(null); // 'asc', 'desc', or null
    const lastRefresh = useRef(0);

    // Function to refresh products data
    const refreshProducts = async () => {
        if (Date.now() - lastRefresh.current < 3000) {
            return;
        }
        lastRefresh.current = Date.now();
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const allProductsData = await response.json();

            // Преобразование данных в формат ProductCard
            const formattedProducts = allProductsData.map(product => ({
                id: product.id, // Числовой ID для API
                displayId: `${product.type}_${product.id}`, // Для отображения и ключей
                name: product.name,
                price: parseFloat(product.price) || 0,
                description: product.description || '',
                image: product.imageUrl || '/images/default.png',
                color: product.color || '',
                type: product.type,
                inStock: product.inStock || 0,
                popularity: product.popularity || 0,
                specialOffer: product.specialOffer || false,
                composition: product.composition || ''
            }));

            // Сортируем по ID для консистентности
            formattedProducts.sort((a, b) => a.id - b.id);

            setProducts(formattedProducts);
        } catch (err) {
            console.error('Error refreshing products:', err);
        }
    };

    const filteredProducts = products.filter(product => {
        // Category filter
        if (filters.category !== 'all' && product.type !== filters.category) {
            return false;
        }

        // Materials filter
        if (filters.materials && filters.materials.length > 0) {
            const productMaterials = product.composition ? product.composition.split(',').map(m => m.trim()) : [];
            const hasMatchingMaterial = filters.materials.some(selectedMaterial =>
                productMaterials.some(productMaterial =>
                    productMaterial.toLowerCase().includes(selectedMaterial.toLowerCase())
                )
            );
            if (!hasMatchingMaterial) {
                return false;
            }
        }

        // Price filter
        if (filters.maxPrice && product.price > filters.maxPrice) {
            return false;
        }

        // Colors filter
        if (filters.colors && filters.colors.length > 0) {
            if (!filters.colors.includes(product.color)) {
                return false;
            }
        }

        // In stock filter
        if (filters.inStock && product.inStock <= 0) {
            return false;
        }

        // Special offers filter
        if (filters.specialOffers && !product.specialOffer) {
            return false;
        }

        return true;
    });

    const updateSort = (by, order) => {
        setSortBy(by);
        setSortOrder(order);
    };

    const updateFilters = (newFilters) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters
        }));
    };

    // Apply sorting to filtered products
    let sortedProducts = [...filteredProducts];
    if (sortBy && sortOrder) {
        sortedProducts.sort((a, b) => {
            let aVal, bVal;
            if (sortBy === 'popularity') {
                aVal = a.popularity || 0;
                bVal = b.popularity || 0;
            } else if (sortBy === 'price') {
                aVal = a.price || 0;
                bVal = b.price || 0;
            }
            if (sortOrder === 'asc') {
                return aVal - bVal;
            } else {
                return bVal - aVal;
            }
        });
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch all products from unified Products table
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const allProductsData = await response.json();

                // Преобразование данных в формат ProductCard
                const formattedProducts = allProductsData.map(product => ({
                    id: product.id, // Числовой ID для API
                    displayId: `${product.type}_${product.id}`, // Для ключей
                    name: product.name,
                    price: parseFloat(product.price) || 0,
                    description: product.description || '',
                    image: product.imageUrl || '/images/default.png',
                    color: product.color || '',
                    type: product.type,
                    inStock: product.inStock || 0,
                    popularity: product.popularity || 0,
                    specialOffer: product.specialOffer || false,
                    composition: product.composition || '' // Keep for filtering, but don't display
                }));

                // Сортируем по ID для консистентности
                formattedProducts.sort((a, b) => a.id - b.id);

                setProducts(formattedProducts);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className={styles.stuffBlock}>
                <h1>ИГРУШКИ</h1>
                <div>Загрузка игрушек...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.stuffBlock}>
                <h1>ИГРУШКИ</h1>
                <div>Ошибка загрузки: {error}</div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.stuffBlock}>
                <h1>ИГРУШКИ</h1>
                <Category currentCategory={filters.category} />
                <FilterLine updateSort={updateSort} sortBy={sortBy} sortOrder={sortOrder} updateFilters={updateFilters} filters={filters} />
                <div className={styles.tovarList}>
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map(product => (
                            <ProductCard key={product.displayId || product.id} product={product} onShowNotification={onShowNotification} onRefreshProducts={refreshProducts} />
                        ))
                    ) : (
                        <div>Игрушки не найдены</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StuffBlock;

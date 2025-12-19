
import { useState, useEffect } from 'react';
import Category from './Components/Category/Category';
import FilterLine from './Components/FilterLine/FilterLine';
import ProductCard from '../ProductCard/ProductCard';
import styles from './StuffBlock.module.css';

function StuffBlock() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    id: `${product.type}_${product.id}`,
                    name: product.name,
                    price: parseFloat(product.price) || 0,
                    description: product.description || '',
                    image: product.imageUrl || '/images/default.png',
                    composition: product.composition || '',
                    color: product.color || '',
                    type: product.type
                }));

                // Сортируем по ID для консистентности
                formattedProducts.sort((a, b) => a.id.localeCompare(b.id));

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
                <Category/>
                <FilterLine />
                <div className={styles.tovarList}>
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
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

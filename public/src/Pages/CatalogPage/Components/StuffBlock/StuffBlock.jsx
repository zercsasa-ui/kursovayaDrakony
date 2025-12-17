
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
        const fetchFigurines = async () => {
            try {
                const response = await fetch('/api/figurines');
                if (!response.ok) {
                    throw new Error('Failed to fetch figurines');
                }
                const figurines = await response.json();

                // Преобразование данных драконов в формат ProductCard
                const formattedProducts = figurines.map(figurine => ({
                    id: figurine.id,
                    name: figurine.name,
                    price: parseFloat(figurine.price) || 0,
                    description: figurine.description || '',
                    image: figurine.imageUrl || '/images/default.png',
                    composition: figurine.composition || ''
                }));

                // Если драконов меньше 4, дублируем их до 4 штук
                let finalProducts = [...formattedProducts];
                while (finalProducts.length < 4 && finalProducts.length > 0) {
                    // Добавляем копии существующих драконов с уникальными id
                    finalProducts.forEach(product => {
                        if (finalProducts.length < 4) {
                            const duplicatedProduct = {
                                ...product,
                                id: `${product.id}_duplicate_${Date.now()}_${Math.random()}`
                            };
                            finalProducts.push(duplicatedProduct);
                        }
                    });
                }

                setProducts(finalProducts);
            } catch (err) {
                console.error('Error fetching figurines:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFigurines();
    }, []);

    if (loading) {
        return (
            <div className={styles.stuffBlock}>
                <h1>ИГРУШКИ-ДРАКОНЫ</h1>
                <div>Загрузка фигурок...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.stuffBlock}>
                <h1>ИГРУШКИ-ДРАКОНЫ</h1>
                <div>Ошибка загрузки: {error}</div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.stuffBlock}>
                <h1>ИГРУШКИ-ДРАКОНЫ</h1>
                <Category/>
                <FilterLine />
                <div className={styles.tovarList}>
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div>Фигурки не найдены</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StuffBlock;

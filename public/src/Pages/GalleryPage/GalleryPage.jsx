import { useState, useEffect } from 'react';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import GalleryProductCard from './Components/GalleryProductCard/GalleryProductCard';
import GalleryUserCard from './Components/GalleryUserCard/GalleryUserCard';
import styles from './GalleryPage.module.css';

function getRandomImageHeight() {
    // Случайная высота карточек: 150px, 300px или 900px
    const baseHeights = [220, 300, 500];
    const randomIndex = Math.floor(Math.random() * baseHeights.length);
    return `${baseHeights[randomIndex]}px`;
}

function GalleryPage() {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGalleryData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Загружаем товары и пользователей параллельно
                const [productsResponse, usersResponse] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/users/public')
                ]);

                if (!productsResponse.ok || !usersResponse.ok) {
                    throw new Error('Ошибка загрузки данных');
                }

                const products = await productsResponse.json();
                const usersData = await usersResponse.json();
                const users = usersData.users || [];

                // Создаем массив элементов галереи
                const productItems = products.map(product => ({
                    type: 'product',
                    data: product,
                    id: `product-${product.id}`
                }));

                const userItems = users.map(user => ({
                    type: 'user',
                    data: user,
                    id: `user-${user.id}`
                }));

                // Объединяем и перемешиваем
                const combinedItems = [...productItems, ...userItems];
                const shuffledItems = combinedItems.sort(() => Math.random() - 0.5);

                setGalleryItems(shuffledItems);
            } catch (err) {
                console.error('Error loading gallery data:', err);
                setError('Ошибка загрузки галереи');
            } finally {
                setLoading(false);
            }
        };

        fetchGalleryData();
    }, []);

    return (
        <div className={styles.galleryPage}>
            <HeaderBlock />
            <main>
                <div className={styles.titleContainer}>
                    <h1>Галерея</h1>
                </div>
                <div className={styles.titleContainerRight}>
                    <h1>Галерея</h1>
                </div>
                <div className={styles.content}>
                    {loading && (
                        <div className={styles.loading}>
                            <p>Загрузка галереи...</p>
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className={styles.galleryGrid}>
                            {galleryItems.map((item) => {
                                const randomImageHeight = getRandomImageHeight();
                                return item.type === 'product' ? (
                                    <GalleryProductCard key={item.id} product={item.data} imageHeight={randomImageHeight} />
                                ) : (
                                    <GalleryUserCard key={item.id} user={item.data} imageHeight={randomImageHeight} />
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default GalleryPage;

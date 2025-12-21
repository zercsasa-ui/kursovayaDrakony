import { useState, useEffect } from 'react';
import styles from './OtziviMainBlock.module.css';

const reviews = [
    {
        id: 1,
        name: "Анна Петрова",
        rating: 5,
        text: "Заказала фигурку дракона для подарка. Мастер подошел к работе с душой, учел все пожелания. Качество исполнения потрясающее! Рекомендую всем, кто ценит ручную работу.",
        date: "15.12.2024"
    },
    {
        id: 2,
        name: "Михаил Сидоров",
        rating: 5,
        text: "Огромное спасибо за прекрасную скульптуру единорога. Детали проработаны идеально, краски яркие и стойкие. Дочь в восторге! Буду заказывать еще.",
        date: "10.12.2024"
    },
    {
        id: 3,
        name: "Елена Козлова",
        rating: 5,
        text: "Фигурка грифона превзошла все ожидания. Материал качественный, сборка надежная. Доставили вовремя, упаковка аккуратная. Отличная работа!",
        date: "05.12.2024"
    },
    {
        id: 4,
        name: "Дмитрий Иванов",
        rating: 5,
        text: "Заказал коллекцию миниатюрных драконов. Каждая фигурка уникальна, внимание к деталям поражает. Цена полностью оправдана качеством. Спасибо за волшебство!",
        date: "28.11.2024"
    },
    {
        id: 5,
        name: "Ольга Сергеева",
        rating: 5,
        text: "Идеальный подарок для любителя фэнтези! Фигурка эльфийки получилась просто шедевром. Материалы премиум-класса, доставка быстрая. Буду вашим постоянным клиентом.",
        date: "20.11.2024"
    }
];

function ReviewCard({ review }) {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={`${styles.star} ${index < rating ? styles.starFilled : styles.starEmpty}`}
            >
                ★
            </span>
        ));
    };

    return (
        <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerName}>{review.name}</div>
                    <div className={styles.reviewDate}>{review.date}</div>
                </div>
                <div className={styles.rating}>
                    {renderStars(review.rating)}
                </div>
            </div>
            <div className={styles.reviewText}>
                {review.text}
            </div>
        </div>
    );
}

function OtziviMainBlock() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? reviews.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === reviews.length - 1 ? 0 : currentIndex + 1);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className={styles.otziviBlockBg}>
            <div className={styles.otziviBlock}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.title}>Отзывы клиентов</h2>
                    <p className={styles.subtitle}>
                        Что говорят о нас наши клиенты
                    </p>
                </div>
                <div className={styles.sliderContainer}>
                    <button
                        className={`${styles.navButton} ${styles.prevButton}`}
                        onClick={goToPrevious}
                        aria-label="Предыдущий отзыв"
                    >
                        ‹
                    </button>

                    <div className={styles.sliderWrapper}>
                        <div
                            key={currentIndex}
                            className={styles.slide}
                        >
                            <ReviewCard review={reviews[currentIndex]} />
                        </div>
                    </div>

                    <button
                        className={`${styles.navButton} ${styles.nextButton}`}
                        onClick={goToNext}
                        aria-label="Следующий отзыв"
                    >
                        ›
                    </button>
                </div>

                <div className={styles.dotsContainer}>
                    {reviews.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Перейти к отзыву ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OtziviMainBlock;

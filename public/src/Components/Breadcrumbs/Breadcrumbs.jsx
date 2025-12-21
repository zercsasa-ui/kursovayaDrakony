import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTrail, useSpring, animated } from '@react-spring/web';
import styles from './Breadcrumbs.module.css';

function Breadcrumbs() {
    const [isVisible, setIsVisible] = useState(true);
    const [isArrowVisible, setIsArrowVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [crumbs, setCrumbs] = useState([{ label: 'Главная', path: '/' }]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
                setIsArrowVisible(false);
            } else {
                setIsVisible(true);
                setIsArrowVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        const handleMouseMove = (event) => {
            if (event.clientY <= 100) {
                setIsVisible(true);
                setIsArrowVisible(true);
            }
        };

        const handleMouseEnter = () => {
            setIsVisible(true);
            setIsArrowVisible(true);
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousemove', handleMouseMove);

        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (breadcrumbs) breadcrumbs.addEventListener('mouseenter', handleMouseEnter);

        const arrow = document.querySelector(`.${styles.backArrow}`);
        if (arrow) arrow.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousemove', handleMouseMove);
            if (breadcrumbs) breadcrumbs.removeEventListener('mouseenter', handleMouseEnter);
            if (arrow) arrow.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [lastScrollY, styles.backArrow]);

    useEffect(() => {
        // Client-side breadcrumb logic
        let crumbs = [{ label: 'Главная', path: '/' }];
        if (location.pathname.includes('/catalog')) {
            crumbs.push({ label: 'Каталог', path: '/catalog' });
        } else if (location.pathname.includes('/gallery')) {
            crumbs.push({ label: 'Галерея', path: '/gallery' });
        } else if (location.pathname.includes('/profile')) {
            crumbs.push({ label: 'Профиль', path: '/profile' });
        } else if (location.pathname.includes('/register')) {
            crumbs.push({ label: 'Регистрация', path: '/register' });
        } else if (location.pathname.includes('/login')) {
            crumbs.push({ label: 'Авторизация', path: '/login' });
        } else if (location.pathname === '/product') {
            crumbs.push({ label: 'Каталог', path: '/catalog' });
            const product = location.state?.product;
            if (product) {
                crumbs.push({ label: product.name, path: '/product' });
            } else {
                crumbs.push({ label: 'Товар', path: '/product' });
            }
        } else if (location.pathname.includes('/cart')) {
            crumbs.push({ label: 'Корзина', path: '/cart' });
        } else if (location.pathname.includes('/buy')) {
            crumbs.push({ label: 'Корзина', path: '/cart' });
            crumbs.push({ label: 'Оформление заказа', path: '/buy' });
        }
        setCrumbs(crumbs);
    }, [location.pathname, location.state]);

    const trail = useTrail(crumbs.length, {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(-10px)',
        from: { opacity: 0, transform: 'translateY(-10px)' },
        config: { mass: 1, tension: 280, friction: 60 },
    });

    const containerStyle = useSpring({
        opacity: isVisible ? 1 : 0,
        config: { tension: 200, friction: 20 }
    });

    const handleBackClick = () => {
        if (crumbs.length > 1) {
            const previousCrumb = crumbs[crumbs.length - 2];
            window.location.href = previousCrumb.path;
        }
    };

    return (
        <div className={styles.breadcrumbsWrapper}>
            {crumbs.length > 1 && (
                <button
                    className={`${styles.backArrow} ${!isArrowVisible ? styles.hidden : ''}`}
                    onClick={handleBackClick}
                >
                    <img src="/images/howCreateArrow.png" alt="Назад" />
                </button>
            )}
            <animated.div className={styles.breadcrumbs} style={containerStyle}>
                <div className={styles.container}>
                    {trail.map((style, index) => (
                        <animated.span key={crumbs[index].path} style={style}>
                            <Link to={crumbs[index].path}>{crumbs[index].label}</Link>
                            {index < crumbs.length - 1 && <span className={styles.separator}> {'>'} </span>}
                        </animated.span>
                    ))}
                </div>
            </animated.div>
        </div>
    );
}

export default Breadcrumbs;

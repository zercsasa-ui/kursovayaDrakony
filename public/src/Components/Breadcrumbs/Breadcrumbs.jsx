import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTrail, useSpring, animated } from '@react-spring/web';
import styles from './Breadcrumbs.module.css';

function Breadcrumbs() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [crumbs, setCrumbs] = useState([{ label: 'Главная', path: '/' }]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        const handleMouseMove = (event) => {
            if (event.clientY <= 100) {
                setIsVisible(true);
            }
        };

        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousemove', handleMouseMove);

        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (breadcrumbs) breadcrumbs.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousemove', handleMouseMove);
            if (breadcrumbs) breadcrumbs.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [lastScrollY]);

    useEffect(() => {
        // Client-side breadcrumb logic
        let crumbs = [{ label: 'Главная', path: '/' }];
        if (location.pathname.includes('/catalog')) {
            crumbs.push({ label: 'Каталог', path: '/catalog' });
        } else if (location.pathname.includes('/gallery')) {
            crumbs.push({ label: 'Галерея', path: '/gallery' });
        } else if (location.pathname.includes('/register')) {
            crumbs.push({ label: 'Регистрация', path: '/register' });
        } else if (location.pathname.includes('/login')) {
            crumbs.push({ label: 'Авторизация', path: '/login' });
        }
        setCrumbs(crumbs);
    }, [location.pathname]);

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

    return (
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
    );
}

export default Breadcrumbs;

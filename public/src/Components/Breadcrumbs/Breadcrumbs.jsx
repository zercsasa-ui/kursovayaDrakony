import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
        const fetchBreadcrumbs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/navigate/breadcrumbs?path=${location.pathname}`);
                const data = await response.json();
                if (data.success) {
                    setCrumbs(data.breadcrumbs);
                }
            } catch (error) {
                console.error('Error fetching breadcrumbs:', error);
                // Fallback to default breadcrumbs
                setCrumbs([{ label: 'Главная', path: '/' }]);
            } finally {
                setLoading(false);
            }
        };

        fetchBreadcrumbs();
    }, [location.pathname]);

    return (
        <div className={`${styles.breadcrumbs} ${isVisible ? styles.visible : styles.hidden}`}>
            <div className={styles.container}>
                {crumbs.map((crumb, index) => (
                    <span key={index}>
                        <Link to={crumb.path}>{crumb.label}</Link>
                        {index < crumbs.length - 1 && <span className={styles.separator}> {'>'} </span>}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default Breadcrumbs;

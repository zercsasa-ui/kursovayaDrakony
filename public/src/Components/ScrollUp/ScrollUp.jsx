import React, { useState, useEffect } from 'react';
import styles from './ScrollUp.module.css';

const ScrollUp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        setIsAnimating(true);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        setTimeout(() => setIsAnimating(false), 500); // Reset animation after scroll
    };

    return (
        <button
            className={`${styles.scrollUpButton} ${isVisible ? styles.visible : styles.hidden} ${isAnimating ? styles.animate : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <img src="/images/strelkaV.svg" alt="Up arrow" />
        </button>
    );
};

export default ScrollUp;

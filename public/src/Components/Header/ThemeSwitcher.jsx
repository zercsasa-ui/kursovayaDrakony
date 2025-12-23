import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import styles from './ThemeSwitcher.module.css';

function ThemeSwitcher({ isScrolled = false, isHovered = false }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });
    const [isGlobalDark, setIsGlobalDark] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsGlobalDark(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Initial check
        setIsGlobalDark(document.documentElement.classList.contains('dark'));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = async () => {
        const newMode = !isDarkMode;

        /**
         * Return early if View Transition API is not supported
         * or user prefers reduced motion
         */
        if (
            !ref.current ||
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            setIsDarkMode(newMode);
            return;
        }

        await document.startViewTransition(() => {
            flushSync(() => {
                setIsDarkMode(newMode);
            });
        }).ready;

        const { top, left, width, height } = ref.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const right = window.innerWidth - left;
        const bottom = window.innerHeight - top;
        const maxRadius = Math.hypot(
            Math.max(left, right),
            Math.max(top, bottom),
        );

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 500,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            }
        );
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <div className={`${styles.themeSwitcher} ${isScrolled && !isHovered ? styles.scrolled : ''} ${isGlobalDark ? styles.globalDark : ''}`}>
            <div className={`${styles.switchRoot} ${isGlobalDark ? styles.globalDark : ''}`} onClick={toggleDarkMode}>
                <div ref={ref} className={`${styles.switchThumb} ${isDarkMode ? styles.checked : ''} ${isGlobalDark ? styles.globalDark : ''}`}>
                    <img src="/images/ThemeSwither.png" alt="Theme Switcher" />
                </div>
            </div>
        </div>
    );
}

export default ThemeSwitcher;

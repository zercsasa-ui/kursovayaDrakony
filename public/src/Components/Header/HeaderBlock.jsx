import { useState, useEffect } from 'react';
import styles from './HeaderBlock.module.css'
import LeftHeaderBlock from './LeftHeaderBlock/LeftHeaderBlock';
import MidHeaderBlock from './MidHeaderBlock/MidHeaderBlock';
import RightHeaderBlock from './RightHeaderBlock/RightHeaderBlock';
import ThemeSwitcher from './ThemeSwitcher';

function HeaderBlock() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isBurgerOpen, setIsBurgerOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleBurger = () => {
        setIsBurgerOpen(!isBurgerOpen);
    };

    return (
        <>
            <div
                className={`${styles.headerBlockBg} ${isScrolled ? styles.scrolled : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <ThemeSwitcher isScrolled={isScrolled} isHovered={isHovered} />
                <div className={`${styles.headerBlock} ${isScrolled ? styles.scrolled : ''}`}>
                    <LeftHeaderBlock />
                    <MidHeaderBlock />
                    <RightHeaderBlock />
                    <button className={styles.burgerButton} onClick={toggleBurger}>
                        <span className={styles.burgerLine}></span>
                        <span className={styles.burgerLine}></span>
                        <span className={styles.burgerLine}></span>
                    </button>
                </div>
                {isBurgerOpen && (
                    <div className={styles.burgerMenu}>
                        <MidHeaderBlock isBurger={true} closeBurger={() => setIsBurgerOpen(false)} />
                        <RightHeaderBlock isBurger={true} closeBurger={() => setIsBurgerOpen(false)} />
                    </div>
                )}
            </div>
        </>
    );
}

export default HeaderBlock;

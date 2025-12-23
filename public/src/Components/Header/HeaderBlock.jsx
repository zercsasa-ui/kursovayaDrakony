import { useState, useEffect } from 'react';
import styles from './HeaderBlock.module.css'
import LeftHeaderBlock from './LeftHeaderBlock/LeftHeaderBlock';
import MidHeaderBlock from './MidHeaderBlock/MidHeaderBlock';
import RightHeaderBlock from './RightHeaderBlock/RightHeaderBlock';
import ThemeSwitcher from './ThemeSwitcher';

function HeaderBlock() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                </div>
            </div>
        </>
    );
}

export default HeaderBlock;

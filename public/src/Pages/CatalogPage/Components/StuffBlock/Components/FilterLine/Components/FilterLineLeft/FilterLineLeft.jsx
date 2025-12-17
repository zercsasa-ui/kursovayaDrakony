import { useState } from 'react';
import styles from './FilterLineLeft.module.css';

function FilterLineLeft() {
    const [popularityState, setPopularityState] = useState(0); // 0: inactive, 1: asc, 2: desc
    const [priceState, setPriceState] = useState(0);

    const getRotation = (state) => {
        if (state === 0) return 'rotate(90deg)'; // right
        if (state === 1) return 'rotate(180deg)'; // up
        if (state === 2) return 'rotate(0deg)'; // down
    };

    const handleClick = (type) => {
        if (type === 'popularity') {
            const nextState = (popularityState + 1) % 3;
            setPopularityState(nextState);
            if (nextState !== 0) setPriceState(0); // deactivate other
        } else if (type === 'price') {
            const nextState = (priceState + 1) % 3;
            setPriceState(nextState);
            if (nextState !== 0) setPopularityState(0); // deactivate other
        }
    };

    return (
        <>
            <div className={styles.filterLineLeft}>
                <div className={`${styles.filterElement} ${popularityState !== 0 ? styles.active : ''}`} onClick={() => handleClick('popularity')}>
                    <p>По популярности</p>
                    <img src="/images/strelkaV.svg" alt="strelka" style={{ transform: getRotation(popularityState), transition: 'transform 0.3s' }} />
                </div>
                <div className={`${styles.filterElement} ${priceState !== 0 ? styles.active : ''}`} onClick={() => handleClick('price')}>
                    <p>По цене</p>
                    <img src="/images/strelkaV.svg" alt="strelka" style={{ transform: getRotation(priceState), transition: 'transform 0.3s' }} />
                </div>
            </div>
        </>
    );
};

export default FilterLineLeft;

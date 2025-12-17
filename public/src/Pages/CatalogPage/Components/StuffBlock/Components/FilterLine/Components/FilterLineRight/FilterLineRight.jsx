import { useState } from 'react';
import styles from './FilterLineRight.module.css';

function FilterLineRight() {
    const [inStock, setInStock] = useState(false);
    const [specialOffers, setSpecialOffers] = useState(false);

    return (
        <>
            <div className={styles.filterLineRight}>
                <div className={`${styles.filterElement} ${inStock ? styles.active : ''}`}>
                    <input
                        type="checkbox"
                        checked={inStock}
                        onChange={() => setInStock(!inStock)}
                    />
                    <p>В наличии</p>
                </div>
                <div className={`${styles.filterElement} ${specialOffers ? styles.active : ''}`}>
                    <input
                        type="checkbox"
                        checked={specialOffers}
                        onChange={() => setSpecialOffers(!specialOffers)}
                    />
                    <p>Спецпредложения</p>
                </div>
            </div>
        </>
    );
};

export default FilterLineRight;

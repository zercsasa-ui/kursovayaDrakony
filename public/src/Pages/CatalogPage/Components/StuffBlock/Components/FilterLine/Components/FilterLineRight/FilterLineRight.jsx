import styles from './FilterLineRight.module.css';

function FilterLineRight({ updateFilters, filters }) {
    const handleInStockChange = () => {
        updateFilters({ inStock: !filters.inStock });
    };

    const handleSpecialOffersChange = () => {
        updateFilters({ specialOffers: !filters.specialOffers });
    };

    return (
        <>
            <div className={styles.filterLineRight}>
                <div className={`${styles.filterElement} ${filters.inStock ? styles.active : ''}`}>
                    <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={handleInStockChange}
                    />
                    <p>В наличии</p>
                </div>
                <div className={`${styles.filterElement} ${filters.specialOffers ? styles.active : ''}`}>
                    <input
                        type="checkbox"
                        checked={filters.specialOffers}
                        onChange={handleSpecialOffersChange}
                    />
                    <p>Спецпредложения</p>
                </div>
            </div>
        </>
    );
};

export default FilterLineRight;

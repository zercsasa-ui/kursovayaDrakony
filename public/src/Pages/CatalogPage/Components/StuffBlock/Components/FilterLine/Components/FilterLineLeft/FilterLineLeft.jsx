import styles from './FilterLineLeft.module.css';

function FilterLineLeft({ updateSort, sortBy, sortOrder }) {
    const getState = (type) => {
        if (sortBy === type) {
            if (sortOrder === 'asc') return 1; // up
            if (sortOrder === 'desc') return 2; // down
        }
        return 0; // right
    };

    const getRotation = (state) => {
        if (state === 0) return 'rotate(90deg)'; // right
        if (state === 1) return 'rotate(180deg)'; // up
        if (state === 2) return 'rotate(0deg)'; // down
    };

    const handleClick = (type) => {
        let newBy = sortBy;
        let newOrder = sortOrder;

        if (sortBy === type) {
            // Cycle: asc -> desc -> null
            if (sortOrder === 'asc') {
                newOrder = 'desc';
            } else if (sortOrder === 'desc') {
                newBy = null;
                newOrder = null;
            }
        } else {
            // Switch to this type, start with asc
            newBy = type;
            newOrder = 'asc';
        }

        updateSort(newBy, newOrder);
    };

    return (
        <>
            <div className={styles.filterLineLeft}>
                <div className={`${styles.filterElement} ${getState('popularity') !== 0 ? styles.active : ''}`} onClick={() => handleClick('popularity')}>
                    <p>По популярности</p>
                    <img src="/images/strelkaV.svg" alt="strelka" style={{ transform: getRotation(getState('popularity')), transition: 'transform 0.3s' }} />
                </div>
                <div className={`${styles.filterElement} ${getState('price') !== 0 ? styles.active : ''}`} onClick={() => handleClick('price')}>
                    <p>По цене</p>
                    <img src="/images/strelkaV.svg" alt="strelka" style={{ transform: getRotation(getState('price')), transition: 'transform 0.3s' }} />
                </div>
            </div>
        </>
    );
};

export default FilterLineLeft;

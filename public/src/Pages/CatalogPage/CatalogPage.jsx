import { useState } from 'react';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import styles from './CatalogPage.module.css';
import FiltersBlock from './Components/FiltersBlock/FiltersBlock';
import StuffBlock from './Components/StuffBlock/StuffBlock';

function CatalogPage() {
    const [filters, setFilters] = useState({
        category: 'all',
        materials: [],
        maxPrice: null,
        colors: [],
        inStock: false,
        specialOffers: false
    });

    return (
        <>
            <div className={styles.catalogPage}>
                <HeaderBlock />
                <main>
                    <div className={styles.filtersLeft}>
                        <FiltersBlock setFilters={setFilters} />
                    </div>
                    <div className={styles.stuffRight}>
                        <StuffBlock filters={filters} setFilters={setFilters} />
                    </div>
                </main>
            </div>
        </>
    );
};

export default CatalogPage;

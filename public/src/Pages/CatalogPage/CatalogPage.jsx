import HeaderBlock from '../../Components/Header/HeaderBlock';
import styles from './CatalogPage.module.css';
import FiltersBlock from './Components/FiltersBlock/FiltersBlock';
import StuffBlock from './Components/StuffBlock/StuffBlock';

function CatalogPage() {

    return (
        <>
            <div className={styles.catalogPage}>
                <HeaderBlock />
                <main>
                    <div className={styles.filtersLeft}>
                        <FiltersBlock />
      
                    </div>
                    <div className={styles.stuffRight}>
                        <StuffBlock />   
                    </div>
                </main>
            </div>
        </>
    );
};

export default CatalogPage;

import Categories from './Categories/Categories';
import Colors from './Colors/Colors';
import Costs from './Costs/Costs';
import styles from './FiltersBlock.module.css';
import Materials from './Materials/Materials';

function FiltersBlock({ setFilters }) {

    return (
        <>
            <div className={styles.filters}>
                <Categories setFilters={setFilters} />
                <Materials setFilters={setFilters} />
                <Costs setFilters={setFilters} />
                <Colors setFilters={setFilters} />
            </div>
        </>
    );
}

export default FiltersBlock;

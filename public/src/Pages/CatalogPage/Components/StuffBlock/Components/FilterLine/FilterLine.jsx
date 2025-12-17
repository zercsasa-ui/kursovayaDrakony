import FilterLineLeft from './Components/FilterLineLeft/FilterLineLeft';
import FilterLineRight from './Components/FilterLineRight/FilterLineRight';
import styles from './FilterLine.module.css';

function FilterLine() {
    return (
        <>
            <div className={styles.filterLine}>
                <FilterLineLeft />
                <FilterLineRight/>
            </div>
        </>
    );
};

export default FilterLine
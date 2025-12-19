import FilterLineLeft from './Components/FilterLineLeft/FilterLineLeft';
import FilterLineRight from './Components/FilterLineRight/FilterLineRight';
import styles from './FilterLine.module.css';

function FilterLine({ updateSort, sortBy, sortOrder, updateFilters, filters }) {
    return (
        <>
            <div className={styles.filterLine}>
                <FilterLineLeft updateSort={updateSort} sortBy={sortBy} sortOrder={sortOrder} />
                <FilterLineRight updateFilters={updateFilters} filters={filters} />
            </div>
        </>
    );
};

export default FilterLine

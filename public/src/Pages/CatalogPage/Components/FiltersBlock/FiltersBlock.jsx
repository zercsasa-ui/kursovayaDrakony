import Categories from './Categories/Categories';
import Colors from './Colors/Colors';
import Costs from './Costs/Costs';
import styles from './FiltersBlock.module.css';
import Materials from './Materials/Materials';

function FiltersBlock() {

    return (
        <>
            <div className={styles.filters}>
                <Categories />
                <Materials />
                <Costs />
                <Colors />
            </div>
        </>
    );
}

export default FiltersBlock;

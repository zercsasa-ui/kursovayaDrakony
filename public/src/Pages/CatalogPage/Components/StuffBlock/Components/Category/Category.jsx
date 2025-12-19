import styles from "./Category.module.css";

function Category({ currentCategory }) {

    return (
        <>
            <div className={styles.categorys}>
                <div className={`${styles.category} ${currentCategory === 'dragon' ? styles.active : ''}`}>
                    <h2>Драконы</h2>
                </div>
                <div className={`${styles.category} ${currentCategory === 'doll' ? styles.active : ''}`}>
                    <h2>Куклы</h2>
                </div>
                <div className={`${styles.category} ${currentCategory === 'props' ? styles.active : ''}`}>
                    <h2>Различные части</h2>
                </div>
            </div>
        </>
    )
}

export default Category;

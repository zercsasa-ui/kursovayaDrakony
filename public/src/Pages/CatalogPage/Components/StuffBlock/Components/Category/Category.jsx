import styles from "./Category.module.css";

function Category() {

    return (
        <>
            <div className={styles.categorys}>
                <div className={styles.category}>
                    <h2>Драконы</h2>
                </div>
                <div className={styles.category}>
                    <h2>Куклы</h2>
                </div>
                <div className={styles.category}>
                    <h2>Различные части</h2>
                </div>
            </div>
        </>
    )
}

export default Category;
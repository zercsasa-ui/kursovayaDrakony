import styles from './Categories.module.css';

function Categories() {
    return (
        <>
            <div className={styles.catogories}>
                <h1>Категории</h1>
                <form>
                    <div>
                        <input type="radio" name="category" id="" placeholder='Всё сразу'/>
                        <p>Всё сразу</p>
                    </div>
                    <div>
                        <input type="radio" name="category" id="" placeholder='Драконы' />
                        <p>Драконы</p>
                    </div>
                    <div>
                        <input type="radio" name="category" id="" placeholder='Куклы' />
                        <p>Куклы</p>
                    </div>
                    <div>
                        <input type="radio" name="category" id="" placeholder='Различные части' />
                        <p>Различные части</p>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Categories;
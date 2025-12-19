import styles from './Categories.module.css';

function Categories({ setFilters }) {
    const handleChange = (e) => {
        setFilters(prev => ({
            ...prev,
            category: e.target.value
        }));
    };

    return (
        <>
            <div className={styles.catogories}>
                <h1>Категории</h1>
                <form>
                    <div>
                        <input type="radio" name="category" value="all" onChange={handleChange} defaultChecked />
                        <p>Всё сразу</p>
                    </div>
                    <div>
                        <input type="radio" name="category" value="dragon" onChange={handleChange} />
                        <p>Драконы</p>
                    </div>
                    <div>
                        <input type="radio" name="category" value="doll" onChange={handleChange} />
                        <p>Куклы</p>
                    </div>
                    <div>
                        <input type="radio" name="category" value="props" onChange={handleChange} />
                        <p>Различные части</p>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Categories;

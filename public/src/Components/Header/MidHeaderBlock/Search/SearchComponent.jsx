import styles from './SearchComponent.module.css';

function SearchComponent() {
    
    return (
        <>
            <div className={styles.search}>
                <img src="/images/searhIcom.svg" alt="search" />
                <p>ПОИСК</p>
            </div>
        </>
    );
}

export default SearchComponent;
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchComponent.module.css';

function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const navigate = useNavigate();

    // Debounce search function
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    const searchProducts = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsDropdownOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/products/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data);
                setIsDropdownOpen(true); // Открываем dropdown всегда при наличии запроса
            } else {
                setResults([]);
                setIsDropdownOpen(true); // Открываем dropdown даже при ошибке
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setIsDropdownOpen(true); // Открываем dropdown даже при ошибке
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback(debounce(searchProducts, 300), [searchProducts]);

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearchClick = () => {
        setIsActive(true);
    };

    const handleInputFocus = () => {
        setIsActive(true);
        if (query.trim()) {
            setIsDropdownOpen(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding dropdown to allow click on results
        setTimeout(() => {
            setIsDropdownOpen(false);
            setIsActive(false);
        }, 150);
    };

    const handleProductClick = (product) => {
        setIsDropdownOpen(false);
        setIsActive(false);
        setQuery('');
        navigate('/product', { state: { product } });
    };

    return (
        <div
            className={`${styles.searchContainer} ${isActive ? styles.active : ''}`}
            onClick={handleSearchClick}
        >
            <div className={styles.search}>
                <img src="/images/searhIcom.svg" alt="search" />
                {isActive ? (
                    <input
                        type="text"
                        placeholder="ПОИСК"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className={styles.searchInput}
                        autoFocus
                    />
                ) : (
                    <p>ПОИСК</p>
                )}
            </div>

            {isDropdownOpen && (
                <div className={styles.dropdown}>
                    {isLoading ? (
                        <div className={styles.loading}>Поиск...</div>
                    ) : results.length > 0 ? (
                        results.map((product) => (
                            <div
                                key={product.id}
                                className={styles.searchResult}
                                onClick={() => handleProductClick(product)}
                            >
                                <img
                                    src={product.imageUrl || '/images/Custom.jpg'}
                                    alt={product.name}
                                    className={styles.resultImage}
                                    onError={(e) => {
                                        e.target.src = '/images/Custom.jpg';
                                    }}
                                />
                                <div className={styles.resultInfo}>
                                    <div className={styles.resultName}>{product.name}</div>
                                    <div className={styles.resultPrice}>{product.price} ₽</div>
                                </div>
                            </div>
                        ))
                    ) : query.trim() && !isLoading ? (
                        <div className={styles.noResults}>Ничего не найдено</div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default SearchComponent;

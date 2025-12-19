import { useState, useEffect } from 'react';
import styles from './Costs.module.css';

function Costs({ setFilters }) {
    const [value, setValue] = useState(0); // Default to 0 (disabled)
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('0');

    const handleSliderChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        setInputValue(newValue);
    };

    const handleValueClick = () => {
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        saveInputValue();
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveInputValue();
        } else if (e.key === 'Escape') {
            setInputValue(value);
            setIsEditing(false);
        }
    };

    const saveInputValue = () => {
        const numValue = parseInt(inputValue, 10);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 200000) {
            setValue(numValue);
        } else {
            setInputValue(value); // Reset to current value if invalid
        }
        setIsEditing(false);
    };

    useEffect(() => {
        // When value is 0, disable the filter (set to null)
        // Otherwise, apply the filter with the selected value
        setFilters(prev => ({
            ...prev,
            maxPrice: value > 0 ? parseInt(value) : null
        }));
    }, [value, setFilters]);

    return (
        <>
            <div className={styles.costs}>
                <h1>Стоимость</h1>
                <div className={styles.sliderContainer}>
                    <input
                        type="range"
                        min="0"
                        max="200000"
                        value={value}
                        onChange={handleSliderChange}
                        className={styles.slider}
                    />
                    {isEditing ? (
                        <input
                            type="number"
                            min="0"
                            max="200000"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            className={styles.valueInput}
                            autoFocus
                        />
                    ) : (
                        <div className={styles.valueDisplay} onClick={handleValueClick}>
                            {value === 0 ? 'Не ограничено' : `${value} ₽`}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Costs;

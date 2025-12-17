import { useState } from 'react';
import styles from './Costs.module.css';

function Costs() {
    const [value, setValue] = useState(50000); // Default to middle value
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('50000');

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
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 200000) {
            setValue(numValue);
        } else {
            setInputValue(value); // Reset to current value if invalid
        }
        setIsEditing(false);
    };

    return (
        <>
            <div className={styles.costs}>
                <h1>Стоимость</h1>
                <div className={styles.sliderContainer}>
                    <input
                        type="range"
                        min="1"
                        max="200000"
                        value={value}
                        onChange={handleSliderChange}
                        className={styles.slider}
                    />
                    {isEditing ? (
                        <input
                            type="number"
                            min="1"
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
                            {value} ₽
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Costs;

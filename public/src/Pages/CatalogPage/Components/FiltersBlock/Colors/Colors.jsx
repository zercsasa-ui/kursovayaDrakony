import { useState } from 'react';
import styles from './Colors.module.css';

function Colors() {
    const [selectedColors, setSelectedColors] = useState([]);

    const someColors = [
        { color: 'black', background: 'black', glow: '#000' },
        { color: 'red', background: 'red', glow: '#f00' },
        { color: 'rainbow', background: 'linear-gradient(45deg, #ffb3ba, #ffdfba, #ffffba, #baffba, #bae1ff, #d1baff, #ffb3ff)', glow: '#ffd700' }
    ];

    const toggleColor = (color) => {
        if (selectedColors.includes(color)) {
            setSelectedColors(selectedColors.filter(c => c !== color));
        } else {
            setSelectedColors([...selectedColors, color]);
        }
    };

    return (
        <>
            <div className={styles.colors}>
                <h1>Цвета</h1>
                <div>
                    {someColors.map(colorObj => (
                        <div
                            key={colorObj.color}
                            className={styles.color1}
                            style={{
                                background: colorObj.background,
                                ...(selectedColors.includes(colorObj.color) ? { boxShadow: `0 0 10px ${colorObj.glow}` } : {})
                            }}
                            onClick={() => toggleColor(colorObj.color)}
                        >
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Colors;

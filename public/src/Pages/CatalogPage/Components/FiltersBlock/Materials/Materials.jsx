import { useState, useEffect } from 'react';
import styles from './Materials.module.css';

function Materials({ setFilters }) {
    const [selectedMaterials, setSelectedMaterials] = useState(new Set());

    const materials = [
        'Полимерная глина',
        'Эпоксидная смола',
        'Краски',
        'Лак',
        'Кожа',
        'Стекло'
    ];

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            materials: Array.from(selectedMaterials)
        }));
    }, [selectedMaterials, setFilters]);

    const handleMaterialClick = (material) => {
        setSelectedMaterials(prev => {
            const newSet = new Set(prev);
            if (newSet.has(material)) {
                newSet.delete(material);
            } else {
                newSet.add(material);
            }
            return newSet;
        });
    };

    return (
        <>
            <div className={styles.materials}>
                <h1>Материалы</h1>
                <div>
                    {materials.map((material, index) => (
                        <button
                            key={index}
                            className={`${styles.materialButton} ${selectedMaterials.has(material) ? styles.selected : ''}`}
                            onClick={() => handleMaterialClick(material)}
                        >
                            {material}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Materials;

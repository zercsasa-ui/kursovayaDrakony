import { useState, useEffect } from 'react';
import styles from './StepByStepInstructions.module.css';

function StepByStepInstructions() {
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const getVideoPath = (stepId) => {
        if (isDarkMode && stepId <= 5) {
            return `/videos/step${stepId}Black.mp4`;
        }
        return `/videos/step${stepId}.mp4`;
    };

    const steps = [
        {
            id: 1,
            title: "Шаг 1: Подготовка материалов",
            image: getVideoPath(1),
            text: "Подготовьте все необходимые материалы: глину, инструменты, краски и основу для скульптуры."
        },
        {
            id: 2,
            title: "Шаг 2: Создание эскиза",
            image: getVideoPath(2),
            text: "Нарисуйте эскиз будущей скульптуры, определите пропорции и композицию."
        },
        {
            id: 3,
            title: "Шаг 3: Лепка основы",
            image: getVideoPath(3),
            text: "Создайте базовую форму скульптуры из глины, используя основные пропорции."
        },
        {
            id: 4,
            title: "Шаг 4: Детализация",
            image: getVideoPath(4),
            text: "Проработайте детали скульптуры, добавьте текстуру и мелкие элементы."
        },
        {
            id: 5,
            title: "Шаг 5: Сушка и обработка",
            image: getVideoPath(5),
            text: "Дайте скульптуре высохнуть, затем обработайте поверхность специальными составами."
        },
        {
            id: 6,
            title: "Шаг 6: Покраска",
            image: getVideoPath(6),
            text: "Нанесите краски, создавая реалистичную цветовую гамму и эффекты."
        },
        {
            id: 7,
            title: "Шаг 7: Финальная отделка",
            image: getVideoPath(7),
            text: "Завершите работу лаком и финальными штрихами для идеального результата."
        },
        {
            id: 8,
            title: "Шаг 8: Презентация работы",
            image: getVideoPath(8),
            text: "Подготовьте скульптуру к презентации, выберите подходящее освещение и фон."
        }
    ];

    const renderMedia = (step) => {
        if (step.id <= 8) {
            return (
                <video
                    src={step.image}
                    className={`${styles.stepImage} ${styles.videoElement}`}
                    muted
                    loop
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => e.target.pause()}
                    onDoubleClick={(e) => {
                        e.target.controls = true;
                        if (e.target.requestFullscreen) {
                            e.target.requestFullscreen();
                        }
                    }}
                />
            );
        } else {
            return (
                <img
                    src={step.image}
                    alt={step.title}
                    className={styles.stepImage}
                    onError={(e) => {
                        e.target.src = '/images/default.png';
                    }}
                />
            );
        }
    };

    const renderThreeCardRow = (step1, step2, step3, index) => (
        <div key={`row-${index}`} className={styles.stepRow}>
            <div className={styles.stepCard}>
                <h3 className={styles.stepTitle}>{step1.title}</h3>
                <div className={styles.imageContainer}>
                    {renderMedia(step1)}
                </div>
                <p className={styles.stepText}>{step1.text}</p>
            </div>
            <div className={styles.arrow}>
                <img src="/images/howCreateArrow.png" alt="стрелка" />
            </div>
            <div className={styles.stepCard}>
                <h3 className={styles.stepTitle}>{step2.title}</h3>
                <div className={styles.imageContainer}>
                    {renderMedia(step2)}
                </div>
                <p className={styles.stepText}>{step2.text}</p>
            </div>
            <div className={styles.arrow}>
                <img src="/images/howCreateArrow.png" alt="стрелка" />
            </div>
            <div className={styles.stepCard}>
                <h3 className={styles.stepTitle}>{step3.title}</h3>
                <div className={styles.imageContainer}>
                    {renderMedia(step3)}
                </div>
                <p className={styles.stepText}>{step3.text}</p>
            </div>
        </div>
    );

    const renderTwoCardRow = (step1, step2, index) => (
        <div key={`row-${index}`} className={`${styles.stepRow} ${styles.twoCardRow}`}>
            <div className={styles.stepCard}>
                <h3 className={styles.stepTitle}>{step1.title}</h3>
                <div className={styles.imageContainer}>
                    {renderMedia(step1)}
                </div>
                <p className={styles.stepText}>{step1.text}</p>
            </div>
            <div className={styles.arrow}>
                <img src="/images/howCreateArrow.png" alt="стрелка" />
            </div>
            <div className={styles.stepCard}>
                <h3 className={styles.stepTitle}>{step2.title}</h3>
                <div className={styles.imageContainer}>
                    {renderMedia(step2)}
                </div>
                <p className={styles.stepText}>{step2.text}</p>
            </div>
        </div>
    );

    return (
        <div id="stepByStepInstructions" className={styles.stepByStepBlock}>
            <div className={styles.container}>
                <h2 className={styles.title}>Пошаговая инструкция</h2>
                <div className={styles.stepsContainer}>
                    {renderThreeCardRow(steps[0], steps[1], steps[2], 0)}
                    {renderTwoCardRow(steps[3], steps[4], 1)}
                    {renderThreeCardRow(steps[5], steps[6], steps[7], 2)}
                </div>
            </div>
        </div>
    );
}

export default StepByStepInstructions;

import { useNavigate } from 'react-router-dom';
import styles from './CustomFigurinesBlock.module.css';

function CustomFigurinesBlock() {
    const navigate = useNavigate();

    const handleOrderClick = () => {
        navigate('/custom-order');
    };

    return (
        <div className={styles.customFigurinesBg}>
            <div className={styles.decorativeLeft}></div>
            <div className={styles.decorativeRight}></div>
            <div className={styles.customFigurines}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.title}>А можно ли заказать фигурку со своей идеей?</h2>
                </div>
                <div className={styles.featuredCard}>
                    <div className={styles.imageContainer}>
                        <img
                            src="/images/Custom.jpg"
                            alt="Кастомные фигурки"
                            className={styles.customImage}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                    <div className={styles.infoContainer}>
                        <div className={styles.productInfo}>
                            <p className={styles.text}>
                                Конечно можно, с вас придумать идею и подробно описать в заявке, после чего дождаться когда Я установлю вам цену, оценив обьем работ. Дальше уже ваш выбор, согласиться или нет. Креатив приветствуется)
                            </p>
                            <button className={styles.orderButton} onClick={handleOrderClick}>
                                Заказать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomFigurinesBlock;

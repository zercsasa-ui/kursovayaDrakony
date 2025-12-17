import styles from './PrivetBlockMain.module.css';
import PrivetTextBlock from './Components/PrivetTextBlock';

function PrivetBlockMain() {
    return (
        <div className={styles.privetBlockBg}>
        <div className={styles.privetBlock}>
                <PrivetTextBlock />
                <div className={styles.verticalLine}></div>
                <div className={styles.imageContainer}>
                    <img
                        src="/images/PrivetAva.jpg"
                        alt="Приветственный дракон"
                        className={styles.dragonImage}
                    />
                </div>
            </div>
        </div>
    );
}

export default PrivetBlockMain;

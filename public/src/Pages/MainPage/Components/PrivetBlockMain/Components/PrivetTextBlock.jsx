import styles from './PrivetTextBlock.module.css';

function PrivetTextBlock() {
    return (
        <div className={styles.textContent}>
            <h2 className={styles.title}>Добро пожаловать в мир <br /> Драконов!</h2>
            <p className={styles.description}>
                Меня зовут Миннахметова Нинель. <br /> Я скульптор барельефист. Искусство должно быть чем то, что освобождает Вашу душу, пробуждает воображение и побуждает людей идти дальше ❤.
                Здесь Я буду делится тем, что спрятано в моей душе и рвется из нее ❤️
            </p>
        </div>
    );
}

export default PrivetTextBlock;

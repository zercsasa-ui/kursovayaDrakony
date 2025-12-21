import styles from './VideoProcessBlock.module.css';

function VideoProcessBlock({ onToggleInstructions, showInstructions }) {
    return (
        <div id="videoProcessBlock" className={styles.videoProcessBlockBg}>
            <div className={styles.videoProcessBlock}>
                <div className={styles.videoContainer}>
                    <video
                        className={styles.processVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/videos/Viev.mp4" type="video/mp4" />
                        Ваш браузер не поддерживает видео тег.
                    </video>
                </div>
                <div className={styles.textContent}>
                    <h2 className={styles.title}>Процесс создания скульптур</h2>
                    <p className={styles.description}>
                        Такой сложный и многоступенчатый процесс — от идеи до последнего мазка лака — это не только ремесло, но и настоящее искусство. Каждая фигурка становится материальным воплощением фантазии и кропотливого труда мастера.
                    </p>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <button
                    className={styles.customButton}
                    onClick={onToggleInstructions}
                >
                    <img
                        src="/images/howCreateArrow.png"
                        alt="Показать пошаговую инструкцию"
                        className={`${styles.buttonImage} ${showInstructions ? styles.rotated : ''}`}
                    />
                </button>
            </div>
        </div>
    );
}

export default VideoProcessBlock;

import styles from './VideoProcessBlock.module.css';
import { useSpring, animated } from '@react-spring/web';

function VideoProcessBlock({ onToggleInstructions, showInstructions }) {
    const [springProps, api] = useSpring(() => ({ scale: 1 }));
    const rotationProps = useSpring({ rotation: showInstructions ? 180 : 0 });

    const handleMouseEnter = () => api.start({ scale: 1.05 });
    const handleMouseLeave = () => api.start({ scale: 1 });
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
                <animated.button
                    className={styles.customButton}
                    style={springProps}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={onToggleInstructions}
                >
                    <animated.img
                        src="/images/howCreateArrow.png"
                        alt="Показать пошаговую инструкцию"
                        className={styles.buttonImage}
                        style={{ transform: rotationProps.rotation.to(r => `rotate(${r}deg)`) }}
                    />
                </animated.button>
            </div>
        </div>
    );
}

export default VideoProcessBlock;

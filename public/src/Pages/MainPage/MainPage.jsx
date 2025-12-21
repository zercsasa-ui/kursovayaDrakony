import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransition, animated } from '@react-spring/web';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import PrivetBlockMain from './Components/PrivetBlockMain/PrivetBlockMain';
import VideoProcessBlock from './Components/VideoProcessBlock/VideoProcessBlock';
import StepByStepInstructions from './Components/StepByStepInstructions/StepByStepInstructions';
import LatestPublicationBlock from './Components/LatestPublicationBlock/LatestPublicationBlock';
import CustomFigurinesBlock from './Components/CustomFigurinesBlock/CustomFigurinesBlock';
import OtziviMainBlock from './Components/OtziviMainBlock/OtziviMainBlock';
import styles from './MainPage.module.css';

function MainPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const navigate = useNavigate();

    const smoothScrollTo = (element, duration = 1000) => {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    };

    const handleGoToGallery = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/gallery');
            const data = await response.json();
            console.log('Gallery API response:', data);
            // Переход на страницу галереи
            navigate('/gallery');
        } catch (error) {
            console.error('Error fetching gallery data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleInstructions = () => {
        if (showInstructions) {
            // Scrolling to VideoProcessBlock when closing
            const videoBlock = document.getElementById('videoProcessBlock');
            if (videoBlock) {
                smoothScrollTo(videoBlock, 1500);
            }
        } else {
            // Scrolling to StepByStepInstructions when opening
            setTimeout(() => {
                const instructionsBlock = document.getElementById('stepByStepInstructions');
                if (instructionsBlock) {
                    smoothScrollTo(instructionsBlock, 1500);
                }
            }, 10); // Longer delay for smoother experience
        }
        setShowInstructions(!showInstructions);
    };

    const transitions = useTransition(showInstructions, {
        from: { opacity: 0, transform: 'translateY(-20px)' },
        enter: { opacity: 1, transform: 'translateY(0px)' },
        leave: { opacity: 0, transform: 'translateY(-20px)' },
        config: { duration: 1000 },
    });

    return (
        <div className={styles.mainPage}>
            <HeaderBlock />
            <PrivetBlockMain />
            <VideoProcessBlock onToggleInstructions={toggleInstructions} showInstructions={showInstructions} />
            {transitions((style, item) =>
                item && <animated.div style={style}><StepByStepInstructions /></animated.div>
            )}
            <LatestPublicationBlock />
            <CustomFigurinesBlock />
            <OtziviMainBlock />
        </div>
    );
}

export default MainPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import PrivetBlockMain from './Components/PrivetBlockMain/PrivetBlockMain';
import VideoProcessBlock from './Components/VideoProcessBlock/VideoProcessBlock';
import OtziviMainBlock from './Components/OtziviMainBlock/OtziviMainBlock';
import styles from './MainPage.module.css';

function MainPage() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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

    return (
        <div className={styles.mainPage}>
            <HeaderBlock />
            <PrivetBlockMain />
            <VideoProcessBlock />
            <OtziviMainBlock />
        </div>
    );
}

export default MainPage;

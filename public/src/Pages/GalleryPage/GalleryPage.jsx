import HeaderBlock from '../../Components/Header/HeaderBlock';
import styles from './GalleryPage.module.css';

function GalleryPage() {
    return (
        <div className={styles.galleryPage}>
            <HeaderBlock />
            <main>
                <div className={styles.content}>
                    <h1>Галерея</h1>
                    <p>Вы успешно перешли на страницу галереи через API запрос!</p>
                    {/* Gallery content goes here */}
                </div>
            </main>
        </div>
    );
}

export default GalleryPage;

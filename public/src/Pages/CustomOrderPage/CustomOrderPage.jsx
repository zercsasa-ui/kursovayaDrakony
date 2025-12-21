import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBlock from '../../Components/Header/HeaderBlock';
import Breadcrumbs from '../../Components/Breadcrumbs/Breadcrumbs';
import styles from './CustomOrderPage.module.css';

function CustomOrderPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        budget: '',
        description: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success'); // 'success' or 'error'

    const openModal = (message, type = 'success') => {
        setModalMessage(message);
        setModalType(type);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
        setModalType('success');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name.trim()) {
            openModal('Пожалуйста, укажите название для фигурки', 'error');
            return;
        }
        if (!formData.description.trim()) {
            openModal('Пожалуйста, опишите заказ', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/orders/custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name.trim(),
                    budget: formData.budget || null,
                    description: formData.description.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                openModal('Заявка отправлена! Я свяжусь с вами для уточнения деталей.');
                setTimeout(() => {
                    navigate('/');
                }, 2000); // Delay navigation to show modal
            } else {
                openModal(data.error || 'Ошибка при создании заказа', 'error');
            }
        } catch (error) {
            console.error('Error submitting custom order:', error);
            openModal('Ошибка при отправке заявки. Попробуйте позже.', 'error');
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className={styles.customOrderPage}>
            <HeaderBlock />
            <Breadcrumbs />
            <main className={styles.mainContent}>
                <div className={styles.formContainer}>
                    <h1 className={styles.pageTitle}>Заказ кастомной фигурки</h1>

                    <form className={styles.orderForm} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Название для фигурки *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Например: Дракон с мечом"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="budget">Примерный бюджет (₽)</label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                placeholder="Например: 5000"
                                min="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Описание заказа *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Подробно опишите вашу идею: что это за персонаж, какие детали важны, стиль, материалы и т.д."
                                rows="6"
                                required
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={handleCancel}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                Сделать заказ
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>{modalType === 'success' ? 'Успех' : 'Ошибка'}</h3>
                        <p>{modalMessage}</p>
                        <div className={styles.modalButtons}>
                            <button onClick={closeModal} className={styles.confirmButton}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomOrderPage;

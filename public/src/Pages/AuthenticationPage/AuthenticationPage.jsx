import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthenticationPage.module.css';

function AuthenticationPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful, redirect to main page or dashboard
                navigate('/');
            } else {
                setError(data.error || 'Ошибка авторизации');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authenticationPage}>
            <div className={styles.authenticationContainer}>
                <h1>Авторизация</h1>
                {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
                <form className={styles.authenticationForm} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Имя пользователя</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.authenticationButton} disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div className={styles.registerLink}>
                    <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
                </div>
            </div>
        </div>
    );
}

export default AuthenticationPage;

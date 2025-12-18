import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Покупатель'
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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Registration successful, user is now logged in
                // Redirect to home page or show success message
                navigate('/');
            } else {
                setError(data.error || 'Ошибка регистрации');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.registerPage}>
            <div className={styles.registerContainer}>
                <h1>Регистрация</h1>
                {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
                <form className={styles.registerForm} onSubmit={handleSubmit}>
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
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
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

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Подтверждение пароля</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.registerButton} disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className={styles.loginLink}>
                    <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;

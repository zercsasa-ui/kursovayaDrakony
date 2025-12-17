import styles from './RegisterPage.module.css';

function RegisterPage() {
    return (
        <div className={styles.registerPage}>
            <div className={styles.registerContainer}>
                <h1>Регистрация</h1>
                <form className={styles.registerForm}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Имя пользователя</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Подтверждение пароля</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.registerButton}>
                        Зарегистрироваться
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

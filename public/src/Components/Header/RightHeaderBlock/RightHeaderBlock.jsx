import styles from './RightHeaderBlock.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function RightHeaderBlock() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/session', {
                credentials: 'include'
            });
            const data = await response.json();
            setIsAuthenticated(data.authenticated);

            if (data.authenticated) {
                const userResponse = await fetch('http://localhost:3000/api/auth/user', {
                    credentials: 'include'
                });
                const userData = await userResponse.json();
                if (userData.success) {
                    setUser(userData.user);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to check auth status:', error);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const handleRegistration = async () => {
        try {
            const response = await fetch('/api/navigate/register');
            const data = await response.json();

            if (data.success) {
                console.log('Navigating to registration via server:', data);
                navigate(data.route);
            } else {
                console.error('Navigation error:', data.error);
            }
        } catch (error) {
            console.error('Navigation request failed:', error);
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleProfile = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                setIsAuthenticated(false);
                setUser(null);
                setIsDropdownOpen(false);
                navigate('/');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleConsole = () => {
        navigate('/admin');
    };

    const handleProfilePage = () => {
        navigate('/profile');
    };

    const handleCart = () => {
        navigate('/cart');
    };

    // Create menu items array based on user role
    const menuItems = user ? [
        { label: 'Профиль', action: handleProfilePage, isLogout: false },
        { label: 'Корзина', action: handleCart, isLogout: false },
        ...((user.role === 'Админ' || user.role === 'Редактор') ? [{ label: 'Консоль', action: handleConsole, isLogout: false }] : []),
        { label: 'divider', action: null, isLogout: false },
        { label: 'Выйти', action: handleLogout, isLogout: true }
    ] : [];

    return (
        <div className={styles.rightHeaderBlock}>
            <button
                className={`${styles.registrationButton} ${isAuthenticated ? styles.hidden : ''}`}
                onClick={handleRegistration}
            >
                РЕГИСТРАЦИЯ
            </button>
            {!isAuthenticated ? (
                <div className={styles.loginContainer} onClick={handleLogin}>
                    <img src="/images/woman.png" alt="вход" />
                </div>
            ) : (
                user && (
                    <div className={styles.profileWrapper}>
                        <span className={`${styles.usernameDisplay} ${user.role === 'Админ' ? styles.adminUsername : ''}`}>
                            {user.username}
                        </span>
                        <div className={`${styles.profileContainer} ${isDropdownOpen ? styles.profileActive : ''}`} onClick={handleProfile}>
                            <img src={user.avatar || "/images/woman.png"} alt="профиль" />
                        </div>
                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                {menuItems.map((menuItem, index) => {
                                    if (menuItem.label === 'divider') {
                                        return (
                                            <div
                                                key={`divider-${index}`}
                                                className={styles.dropdownDivider}
                                            />
                                        );
                                    }
                                    return (
                                        <button
                                            key={`${menuItem.label}-${index}`}
                                            className={`${styles.dropdownItem} ${menuItem.isLogout ? styles.logoutItem : ''}`}
                                            onClick={menuItem.action}
                                        >
                                            {menuItem.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export default RightHeaderBlock;

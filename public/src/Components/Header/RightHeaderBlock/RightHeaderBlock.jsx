import styles from './RightHeaderBlock.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTransition, animated, useTrail } from '@react-spring/web';

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
        ...(user.role === 'Админ' ? [{ label: 'Консоль', action: handleConsole, isLogout: false }] : []),
        { label: 'divider', action: null, isLogout: false },
        { label: 'Выйти', action: handleLogout, isLogout: true }
    ] : [];

    const transitions = useTransition(isDropdownOpen, {
        from: {
            opacity: 0,
            transform: 'translateY(-15px) scale(0.9)',
            transformOrigin: 'top right'
        },
        enter: {
            opacity: 1,
            transform: 'translateY(0px) scale(1)',
            transformOrigin: 'top right'
        },
        leave: {
            opacity: 0,
            transform: 'translateY(-15px) scale(0.9)',
            transformOrigin: 'top right'
        },
        config: {
            tension: 300,
            friction: 25,
            mass: 0.8
        }
    });

    const trail = useTrail(menuItems.length, {
        from: { opacity: 0, transform: 'translateX(-20px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
        config: { tension: 280, friction: 20 },
        delay: 100
    });

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
                        {transitions((style, item) =>
                            item && (
                                <animated.div className={styles.dropdownMenu} style={style}>
                                    {trail.map((itemStyle, index) => {
                                        const menuItem = menuItems[index];
                                        if (menuItem.label === 'divider') {
                                            return (
                                                <animated.div
                                                    key={`divider-${index}`}
                                                    style={itemStyle}
                                                    className={styles.dropdownDivider}
                                                />
                                            );
                                        }
                                        return (
                                            <animated.button
                                                key={`${menuItem.label}-${index}`}
                                                style={itemStyle}
                                                className={`${styles.dropdownItem} ${menuItem.isLogout ? styles.logoutItem : ''}`}
                                                onClick={menuItem.action}
                                            >
                                                {menuItem.label}
                                            </animated.button>
                                        );
                                    })}
                                </animated.div>
                            )
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export default RightHeaderBlock;

import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

const UserBadge: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    const name = user?.name && user.name.trim().length > 0 ? user.name : 'Профиль';

    return (
        <div className="user-badge">
            <div>
                <p className="user-badge__name">{name}</p>
                {user?.email && <p className="user-badge__email">{user.email}</p>}
            </div>
            <button type="button" className="button button_link" onClick={logout}>
                Выйти
            </button>
        </div>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <div className="app-shell">
            <header className="masthead">
                <div>
                    <p className="eyebrow">Big Toys</p>
                    <h1>Автомобильные бренды</h1>
                    <p className="eyebrow-sub">
                        Создавайте записи об автомобильных брендах и моделях.
                    </p>
                </div>
                <div className="masthead__controls">
                    <ThemeToggle />
                    <UserBadge />
                </div>
            </header>
            <main className="page-body">{children}</main>
        </div>
    );
};

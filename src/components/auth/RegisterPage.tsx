import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../api/client';
import ThemeToggle from '../layout/ThemeToggle';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, isAuthenticated } = useAuth();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/brands', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        try {
            await register({ name, email, password });
            navigate('/brands', { replace: true });
        } catch (errorInstance) {
            if (errorInstance instanceof ApiError || errorInstance instanceof Error) {
                setError(errorInstance.message);
            } else {
                setError('Не удалось зарегистрироваться');
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-top">
                <ThemeToggle />
            </div>
            <div
                className="auth-illustration"
                aria-hidden
                style={{ backgroundImage: 'url(/civic.jpg)' }}
            />
            <div className="auth-pane">
                <div className="auth-pane__header">
                    <p className="eyebrow">Big Toys</p>
                    <h1>Создать аккаунт</h1>
                    <p className="muted">Бренды и их модели здесь.</p>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="input-label">
                        <span className="input-label__text">Имя</span>
                        <input
                            className="input"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            required
                        />
                    </label>
                    <label className="input-label">
                        <span className="input-label__text">Email</span>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            required
                        />
                    </label>
                    <label className="input-label">
                        <span className="input-label__text">Пароль</span>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            required
                        />
                    </label>
                    {error && <p className="auth-form__error">{error}</p>}
                    <button type="submit" className="button button_primary" disabled={isLoading}>
                        {isLoading ? 'Создаём…' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="auth-hint">
                    Уже есть аккаунт? <a href="/login">Войти</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

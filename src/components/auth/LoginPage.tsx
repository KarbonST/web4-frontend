import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../api/client';
import ThemeToggle from '../layout/ThemeToggle';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated } = useAuth();
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
            await login({ email, password });
            navigate('/brands', { replace: true });
        } catch (errorInstance) {
            if (errorInstance instanceof ApiError || errorInstance instanceof Error) {
                setError(errorInstance.message);
            } else {
                setError('Не удалось войти');
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
                    <h1>Вход</h1>
                    <p className="muted">Автомобили, на которых мы ездим, многое говорят о нас.</p>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
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
                        {isLoading ? 'Входим…' : 'Войти'}
                    </button>
                </form>
                <p className="auth-hint">
                    Нет аккаунта? <a href="/register">Зарегистрироваться</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

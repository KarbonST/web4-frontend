import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { Layout } from './components/layout/Layout';
import BrandsPage from './components/brands/BrandsPage';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { BrandsProvider } from './context/BrandsProvider';
import BrandDetailPage from './components/brands/BrandDetailPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

const ProtectedRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <Routes>
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/brands/:brandId" element={<BrandDetailPage />} />
                <Route path="*" element={<Navigate to="/brands" replace />} />
            </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrandsProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/*" element={<ProtectedRoutes />} />
                    </Routes>
                </BrandsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;

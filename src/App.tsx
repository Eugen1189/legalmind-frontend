import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { checkHealth } from './api/api'; // <--- ІМПОРТ
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';
import { PasswordRecovery } from './pages/PasswordRecovery';

// Компонент для відображення помилки/завантаження
const StartupStatus: React.FC<{ status: 'loading' | 'error' | 'success' }> = ({ status }) => {
    const message = 
        status === 'loading' 
            ? 'Завантаження системи LegalMind...'
            : 'Помилка: Бекенд LegalMind недоступний. Спробуйте пізніше.';
            
    const bgColor = status === 'error' ? 'bg-red-900' : 'bg-gray-900';

    return (
        <div className={`min-h-screen flex items-center justify-center ${bgColor} text-white`}>
            <div className="text-center p-8">
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-bold text-2xl mx-auto">L</div>
                <h1 className="text-2xl font-bold mb-4">{message}</h1>
                {status === 'error' && (
                    <p className="text-sm text-red-300">
                        Перевірте, чи запущено backend за адресою http://localhost:8000.
                    </p>
                )}
            </div>
        </div>
    );
};

const AppContent = () => {
    const { user } = useAuth();
    // Використовуємо Login/Chat
    return (
        <Routes>
            <Route path="/" element={user ? <Chat /> : <Login />} />
            <Route path="/recover" element={<PasswordRecovery />} />
            <Route path="*" element={user ? <Chat /> : <Login />} />
        </Routes>
    );
};

function App() {
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

    useEffect(() => {
        // Запускаємо Health Check при старті
        const check = async () => {
            const isHealthy = await checkHealth();
            if (isHealthy) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        };
        check();
        
        // Повторна перевірка кожні 10 секунд (для production не потрібно, але корисно для MVP)
        const interval = setInterval(check, 10000); 
        return () => clearInterval(interval);
        
    }, []);

    if (status === 'loading') {
        return <StartupStatus status="loading" />;
    }
    if (status === 'error') {
        return <StartupStatus status="error" />;
    }

    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;

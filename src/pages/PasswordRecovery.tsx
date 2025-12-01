import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PasswordRecovery: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Тут буде реальна логіка виклику API для бекенду
        console.log('Sending recovery email to:', email);
        setIsSent(true);
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/');
        }
    };

    if (isSent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[url('/images/patronato-bg.jpg.png')] bg-cover bg-center bg-fixed bg-[#100c25] bg-blend-multiply transition-colors duration-500">
                <div className="bg-black/50 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm mx-4 border border-white/10 text-white text-center">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('login.recovery_title')}</h2>
                    <p className="mb-6 text-sm sm:text-base">
                        {t('login.recovery_instruction')}
                    </p>
                    <p className="text-green-400 font-semibold mb-6 text-sm sm:text-base">
                        ✅ Посилання для відновлення паролю надіслано на {email}
                    </p>
                    <button 
                        onClick={handleBack}
                        className="text-blue-400 hover:text-blue-300 transition text-sm sm:text-base"
                    >
                        &larr; {t('login.back_to_login')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/images/patronato-bg.jpg.png')] bg-cover bg-center bg-fixed bg-[#100c25] bg-blend-multiply transition-colors duration-500">
            <div className="bg-black/50 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm mx-4 border border-white/10">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-xl font-bold">L</div>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">{t('login.recovery_title')}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
                            {t('login.email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                            placeholder="email@example.com"
                        />
                        <p className="text-xs sm:text-sm text-white/50 mt-2">{t('login.recovery_instruction')}</p>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={email.length === 0}
                    >
                        {t('login.send_recovery')}
                    </button>
                    
                    <div className="mt-6 text-center">
                        <button 
                            onClick={handleBack}
                            type="button"
                            className="text-blue-400 hover:text-blue-300 transition text-sm sm:text-base"
                        >
                            &larr; {t('login.back_to_login')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


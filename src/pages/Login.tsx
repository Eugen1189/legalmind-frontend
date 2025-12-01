import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

type UserLanguage = 'ru' | 'en' | 'it' | 'uk' | 'ro' | 'ar';

export const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<UserLanguage>(i18n.language as UserLanguage || 'it');

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  const handleLanguageChange = (lang: UserLanguage) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, language as any);
    }
  };

  // Determine background styles (no longer changing, it's fixed)
  const backgroundClass = 'bg-[url("/images/patronato-bg.jpg.png")] bg-cover bg-center bg-fixed';

  return (
    // Change div class: add image, rich blue overlay and mix mode
    <div className={`
      min-h-screen flex items-center justify-center relative overflow-hidden
      ${backgroundClass} 
      bg-[#100c25]
      bg-blend-overlay
      transition-colors duration-300
    `}>
      
      {/* 2. DECORATIONS: Background "glow" (Make it less noticeable so it doesn't conflict with card) */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

      {/* 3. CARD: Ultra-Glassmorphism and soft shadows */}
      <div 
        className={`
            relative z-10 w-full max-w-xs sm:max-w-sm p-6 sm:p-8 lg:p-10 
            bg-white/10 dark:bg-white/5 
            backdrop-blur-3xl border border-white/20 
            rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/40 
            transform transition-all duration-700 ease-out
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}
      >
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wide">
                Login
            </h1>
            <p className="text-white/80 text-xs sm:text-sm tracking-widest uppercase">
                {isRegistering ? t('login.subtitle_register') : t('login.subtitle_login')}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-7">
          {/* Group: Email (Input Line Style) */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">
                {t('login.email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full bg-transparent 
                border-t-0 border-x-0 border-b border-white/40
                py-2 sm:py-2.5
                text-sm sm:text-base text-white placeholder-white/70 
                focus:border-white focus:ring-0 focus:outline-none 
                transition-all duration-300
              "
              placeholder="user@webguild"
            />
          </div>

          {/* Group: Password (Input Line Style) */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">
                {t('login.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full bg-transparent 
                border-t-0 border-x-0 border-b border-white/40
                py-2 sm:py-2.5
                text-sm sm:text-base text-white placeholder-white/70 
                focus:border-white focus:ring-0 focus:outline-none 
                transition-all duration-300
              "
              placeholder="••••••••"
            />
          </div>

          {/* Group: Language (Styled for Glassmorphism) */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">
                {t('login.language')}
            </label>
            <div className="relative">
                <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as UserLanguage)}
                className="
                    w-full px-3 sm:px-4 py-2.5 sm:py-3 appearance-none
                    bg-white/10 text-white/90 text-sm sm:text-base
                    border border-white/30 rounded-xl
                    focus:ring-1 focus:ring-blue-400 focus:border-blue-400
                    outline-none cursor-pointer transition-all
                "
                >
                <option value="it" className="bg-[#1a133d] text-white">Italiano 🇮🇹</option>
                <option value="en" className="bg-[#1a133d] text-white">English 🇺🇸</option>
                <option value="uk" className="bg-[#1a133d] text-white">Українська 🇺🇦</option>
                <option value="ru" className="bg-[#1a133d] text-white">Русский</option>
                <option value="ro" className="bg-[#1a133d] text-white">Română/Moldavă 🇷🇴</option>
                <option value="ar" className="bg-[#1a133d] text-white">العربية 🇸🇦</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="
                w-full py-2.5 sm:py-3 lg:py-3.5 mt-6 sm:mt-8
                bg-white text-blue-600 font-bold text-base sm:text-lg
                rounded-xl shadow-lg shadow-white/30 
                transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200
            "
          >
            {isRegistering ? t('login.submit_register') : t('login.submit_login')}
          </button>
          
          {/* ДОДАНО: Посилання на відновлення паролю */}
          {!isRegistering && (
            <div className="mt-4 text-center">
              <Link to="/recover" className="text-blue-400 hover:text-blue-300 transition text-sm sm:text-base">
                {t('login.forgot_password')}
              </Link>
            </div>
          )}
          {/* КІНЕЦЬ ДОДАНОГО */}
        </form>

        {/* Footer: Toggle Mode */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-white/70">
            {isRegistering ? t('login.have_account') : t('login.no_account')}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 text-white font-semibold hover:text-blue-300 transition-colors focus:outline-none"
              type="button"
            >
              {isRegistering ? t('login.toggle_login') : t('login.toggle_register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

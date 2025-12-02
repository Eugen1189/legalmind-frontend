import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { sendMessageToBackend, processAudio } from '../api/api';
import type { Clarification, ChatResponse, ActionItem, Consultant } from '../api/api';
import { useTranslation } from 'react-i18next';
import { InstallPWA } from '../components/InstallPWA';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  fileName?: string;
  // НОВЕ: Індикатори
  source?: "rag" | "web" | "hybrid"; // [cite: 71]
  confidence?: number; // [cite: 78]
  consultants?: Consultant[]; // НОВЕ
  action_items?: ActionItem[]; // НОВЕ
}

const legalChipsKeys = [
    'patronato_query',
    'check_deadlines',
    'find_documents',
    'simulate_case',
];

// Компонент для відображення Action Items
interface ActionItemCardProps {
    actionItem: ActionItem; // Використовуємо імпортований тип
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({ actionItem }) => {
    const { t } = useTranslation();
    const isInstruction = actionItem.type === 'instruction';
    const isLink = actionItem.type === 'link' || actionItem.type === 'document';
    const isForm = actionItem.type === 'form';
    const [isOpen, setIsOpen] = useState(false);

    const icon = isLink ? '🔗' : isForm ? '✍️' : isInstruction ? '📝' : '❓';
    
    return (
        <div className={`
            bg-white/10 dark:bg-white/10 p-3 sm:p-4 rounded-xl shadow-md border border-white/10 dark:border-white/10 mb-3 transition-all duration-300
            ${isInstruction ? 'cursor-pointer hover:bg-white/15 dark:hover:bg-white/15' : ''}
        `} onClick={() => isInstruction && setIsOpen(!isOpen)}>
            
            <div className="flex justify-between items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className="text-lg sm:text-xl shrink-0">{icon}</span>
                    <h4 className="font-semibold text-white dark:text-white text-sm sm:text-base break-words">{actionItem.title}</h4>
                </div>
                {isLink && actionItem.url && (
                    <a href={actionItem.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition text-xs sm:text-sm flex items-center gap-1 shrink-0 whitespace-nowrap">
                        {isForm ? t('action.fill_form') : t('action.open_link')}
                    </a>
                )}
                {isInstruction && (
                    <span className="text-white/70 dark:text-white/70 shrink-0">{isOpen ? '▲' : '▼'}</span>
                )}
            </div>
            
            {actionItem.description && <p className="text-xs sm:text-sm text-white/70 dark:text-white/70 mt-2 break-words">{actionItem.description}</p>}

            {isInstruction && isOpen && actionItem.steps && (
                <ul className="list-disc list-inside text-xs sm:text-sm text-white/90 dark:text-white/90 mt-3 p-2 bg-black/20 dark:bg-black/20 rounded-lg">
                    {actionItem.steps.map((step, index) => (
                        <li key={index} className="py-0.5 sm:py-1 break-words">{step}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Компонент для відображення профілю консультанта
interface ConsultantCardProps {
    consultant: Consultant; // Використовуємо імпортований тип
}

const ConsultantCard: React.FC<ConsultantCardProps> = ({ consultant }) => {
    const { t } = useTranslation();
    const hasContact = consultant.contact_info?.email || consultant.contact_info?.phone;

    // Функція для відображення рейтингу зірочками
    const renderRating = (rating: number) => {
        const fullStars = Math.floor(rating);
        const stars = Array(5).fill('★').map((s, i) => (
            <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-500/50'}>
                {s}
            </span>
        ));
        return (
            <>
                {stars}
                <span className="ml-1 text-white/70 dark:text-white/70">({rating.toFixed(1)})</span>
            </>
        );
    };

    return (
        <div className="bg-black/30 dark:bg-black/30 p-3 sm:p-4 rounded-xl shadow-inner border border-white/10 dark:border-white/10 mt-4">
            <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-blue-400 dark:text-blue-400 break-words">{consultant.name}</h4>
                    <p className="text-xs sm:text-sm text-white/70 dark:text-white/70 break-words">{consultant.specialization}</p>
                    {consultant.location && <p className="text-[10px] sm:text-xs text-white/50 dark:text-white/50 mt-1 break-words">📍 {consultant.location}</p>}
                </div>
                {hasContact && (
                    <button className="bg-primary hover:bg-blue-700 text-white py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-xs sm:text-sm transition shrink-0 whitespace-nowrap">
                        {t('consultant.contact')}
                    </button>
                )}
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10 dark:border-white/10 gap-2 flex-wrap sm:flex-nowrap">
                {consultant.rating !== undefined && (
                    <div className="flex items-center text-xs sm:text-sm">
                        {renderRating(consultant.rating)}
                    </div>
                )}
                <p className="text-[10px] sm:text-xs text-white/70 dark:text-white/70 break-words">
                    🗣️ {consultant.languages.join(', ').toUpperCase()}
                </p>
            </div>
        </div>
    );
};

export const Chat: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // НОВЕ: Реф для аудіо-вводу
  const audioInputRef = useRef<HTMLInputElement>(null);
  // НОВИЙ СТАН: Для зберігання поточного уточнюючого питання
  const [currentClarification, setCurrentClarification] = useState<Clarification | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
        // Залишаємо messages порожнім для відображення Welcome Screen.
    }
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, currentClarification]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Файл занадто великий (макс 5MB)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // НОВА ЛОГІКА: Обробка вибору аудіо-файлу
  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const audioFile = e.target.files?.[0];
      if (!audioFile) return;

      const language = user?.language || 'it';
      const token = user?.token || undefined;
      
      setIsLoading(true);
      
      try {
          // 1. Відправляємо аудіо на транскрипцію
          const transcription = await processAudio(audioFile, language, token);
          
          // 2. Використовуємо транскрибований текст для подальшої обробки
          // В реальному MVP бекенд сам би повернув повну відповідь. 
          // Тут ми симулюємо, що транскрипція стала текстом користувача
          await executeSend(transcription, undefined); 

      } catch (error) {
          // НОВЕ: Обробка помилки 401
          if (error instanceof Error && error.message === 'Unauthorized') {
            alert("Сесія закінчилася. Виконується перенаправлення на сторінку входу.");
            logout(); // Вихід і перенаправлення
            return;
          }
          
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "⚠️ Помилка аудіо-сервісу. Спробуйте ввести текст.",
            sender: 'bot',
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, errorMsg]);
      } finally {
          setIsLoading(false);
          if (audioInputRef.current) audioInputRef.current.value = '';
      }
  };
  
  // PWA logic видалено - тепер у компоненті InstallPWA

  // ДОПОМІЖНА ФУНКЦІЯ: Обробка результату від API
  const processApiResponse = (response: ChatResponse) => {
    const { steps, result } = response;
    
    if (steps.is_ambiguous && steps.clarification) { // [cite: 56]
      // Крок 1: Зберігаємо питання та опції, блокуємо основний інпут
      setCurrentClarification(steps.clarification); // 
      // Не додаємо нічого до історії, чекаємо відповіді
    } else if (result?.status === 'ok' && result.payload.response_native) {
      // Крок 2: Отримуємо фінальну відповідь
      const payload = result.payload; // PatronatoResponsePayload
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: payload.response_native,
        sender: 'bot',
        timestamp: Date.now(),
        source: payload.source,
        confidence: payload.confidence,
        consultants: payload.consultants, // ДОДАНО
        action_items: payload.action_items, // ДОДАНО
      };
      setMessages(prev => [...prev, botMsg]);
      setCurrentClarification(null);
    } else {
      // Обробка невідомого стану/помилки
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chat.error_connect'),
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      setCurrentClarification(null);
    }
  };

  // ОСНОВНА ФУНКЦІЯ: Надсилання та обробка
  const executeSend = async (textToSend: string, fileToSend: File | undefined) => {
    // 1. Додаємо повідомлення користувача в UI
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      fileName: fileToSend?.name,
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Відправка на бекенд
      const token = user?.token || undefined; // Отримуємо токен (якщо є)
      const language = user?.language || 'it';
      
      // Тепер очікуємо повний об'єкт ChatResponse
      const response = await sendMessageToBackend(textToSend, language, fileToSend, token);

      // Обробка відповіді (уточнення чи результат)
      processApiResponse(response);

    } catch (error) {
      // НОВЕ: Обробка помилки 401
      if (error instanceof Error && error.message === 'Unauthorized') {
        alert("Сесія закінчилася. Виконується перенаправлення на сторінку входу.");
        logout(); // Вихід і перенаправлення
        return;
      }
      
      // Обробка загальної помилки
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chat.error_connect'),
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      setCurrentClarification(null);
    } finally {
      setIsLoading(false);
    }
  };

  // НОВА ФУНКЦІЯ: Відповідь на уточнююче питання (натисканням кнопки)
  const handleClarificationAnswer = (answer: string) => {
    setCurrentClarification(null); // Прибираємо UI уточнення
    // Відправляємо відповідь наново як звичайний текст, backend обробить контекст сесії
    executeSend(answer, undefined); 
  };

  const handleChipClick = (key: string) => {
      const promptText = t(`chips.${key}_prompt`);
      executeSend(promptText, undefined);
  };
  
  const handleSend = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    const textToSend = inputValue.trim() || (selectedFile ? `File: ${selectedFile.name}` : '');
    const fileToSend = selectedFile || undefined;

    setInputValue('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    executeSend(textToSend, fileToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`
      flex flex-col h-screen relative overflow-hidden
      bg-gray-100 dark:bg-gray-900 
      transition-colors duration-300
    `}>
      
      {/* HEADER: Адаптація для світлого режиму */}
      <header className="
        bg-white/90 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10
        px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center sticky top-0 z-20 shadow-md transition-colors
      ">
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-bold text-sm sm:text-base">L</div>
            <h1 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white tracking-wider hidden sm:block">LegalMind</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
            <InstallPWA />
            
            <button onClick={toggleTheme} className="p-1.5 sm:p-2 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364 6.364l-1.591 1.591M21 12h-2.25m-6.364 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                )}
            </button>
            
            <button onClick={logout} className="p-1.5 sm:p-2 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 max-w-2xl lg:max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          // --- WELCOME SCREEN (Chips) ---
          <div className="pt-6 sm:pt-10 md:pt-20 px-2 sm:px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 break-words">{t('chips.greeting', { email: user?.email })}</h1>
              <h2 className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-white/70 mb-6 sm:mb-8 md:mb-10 break-words">{t('chips.start_prompt')}</h2>

              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                  {legalChipsKeys.map(key => (
                      <button 
                          key={key}
                          onClick={() => handleChipClick(key)}
                          className="
                              bg-white text-gray-800 border border-gray-300 
                              dark:bg-white/10 dark:text-white/90 dark:border-white/20
                              py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-5 rounded-full text-sm sm:text-base md:text-lg font-medium 
                              hover:bg-gray-100 dark:hover:bg-white/20 transition
                              shadow-md backdrop-blur-sm break-words
                          "
                      >
                          {key === 'patronato_query' && '🇮🇹 '}
                          {key === 'check_deadlines' && '⏳ '}
                          {key === 'find_documents' && '📄 '}
                          {key === 'simulate_case' && '⚖️ '}
                          {t(`chips.${key}`)}
                      </button>
                  ))}
              </div>
          </div>
        ) : (
          // --- ІСТОРІЯ ПОВІДОМЛЕНЬ ---
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl text-xs sm:text-sm md:text-base shadow-lg ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/10' 
                  }`}
                >
                  
                  {msg.fileName && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 bg-gray-200 dark:bg-white/20 p-1.5 sm:p-2 rounded-md sm:rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-[10px] sm:text-xs text-gray-800 dark:text-white truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">{msg.fileName}</span>
                    </div>
                  )}

                  {/* НОВЕ: Індикатори для відповідей бота */}
                  {msg.sender === 'bot' && (msg.source || msg.confidence !== undefined) && (
                    <div className="flex items-center justify-between mt-1 mb-2 gap-1.5 sm:gap-2 flex-wrap">
                      {/* 1. Індикатор джерела (Source) */}
                      {msg.source && (
                        <span 
                          className={`text-[10px] sm:text-xs font-medium py-0.5 px-1.5 sm:px-2 rounded-full ${
                            msg.source === 'rag' ? 'bg-blue-600/30 text-blue-200 dark:bg-blue-600/30 dark:text-blue-200' : 
                            msg.source === 'web' ? 'bg-green-600/30 text-green-200 dark:bg-green-600/30 dark:text-green-200' : 
                            'bg-purple-600/30 text-purple-200 dark:bg-purple-600/30 dark:text-purple-200'
                          }`}
                        >
                          {msg.source === 'rag' ? 'База знань' : msg.source === 'web' ? 'Інтернет' : 'Комбіновано'}
                        </span>
                      )}

                      {/* 2. Індикатор впевненості (Confidence) */}
                      {msg.confidence !== undefined && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-white/70">Впевненість:</span>
                          <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                msg.confidence > 0.7 ? 'bg-green-400' : 
                                msg.confidence > 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.round(msg.confidence * 100)}%` }}
                              title={`${Math.round(msg.confidence * 100)}%`}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Кінець індикаторів */}

                  {/* Тут був msg.text */}
                  <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* НОВЕ: Консультанти та Action Items */}
                  {msg.sender === 'bot' && (
                    <div className="mt-3">
                      {/* Action Items */}
                      {msg.action_items && msg.action_items.map((item, index) => (
                        <ActionItemCard key={index} actionItem={item} />
                      ))}

                      {/* Consultant Card */}
                      {msg.consultants && msg.consultants.length > 0 && (
                        <div className="p-3 bg-black/20 dark:bg-black/20 rounded-xl mt-3 border border-white/10 dark:border-white/10">
                          <h4 className="text-lg font-semibold text-white dark:text-white mb-2">
                            💡 {t('consultant.recommendation')}
                          </h4>
                          {msg.consultants.map((consultant, index) => (
                            // Відображаємо лише першого консультанта для MVP
                            index === 0 && <ConsultantCard key={consultant.id} consultant={consultant} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Кінець доданих блоків */}

                  <div className={`text-[9px] sm:text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-white/50'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-white/10 backdrop-blur-sm p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl rounded-bl-none border border-gray-200 dark:border-white/10 shadow-sm flex gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 dark:bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 dark:bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 dark:bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {/* НОВИЙ БЛОК: Уточнююче питання */}
            {currentClarification && (
              <div className="p-4 mx-auto w-full max-w-lg">
                {/* Питання */}
                <div className="flex justify-start mb-4">
                  <div className="bg-white dark:bg-white/10 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl p-4 border border-gray-200 dark:border-white/20 shadow-xl">
                    <p className="font-semibold mb-3">{currentClarification.question}</p>
                  </div>
                </div>
                
                {/* Опції (якщо є) */}
                {currentClarification.options && (
                  <div className="flex flex-wrap gap-3">
                    {currentClarification.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleClarificationAnswer(option)}
                        className="bg-primary/80 hover:bg-primary text-white py-2 px-4 rounded-full text-sm font-medium transition shadow-md"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {/* INPUT AREA */}
      <footer className="bg-white/90 dark:bg-black/50 backdrop-blur-md border-t border-gray-200 dark:border-white/10 sticky bottom-0 z-20 transition-colors">
        
        {/* ПРЕВ'Ю ОБРАНОГО ФАЙЛУ */}
        {selectedFile && (
            <div className="max-w-4xl mx-auto mb-2 px-2 flex items-center gap-2">
                <div className="bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-full flex items-center gap-2 border border-gray-300 dark:border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0"><path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" /></svg>
                    <span className="text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[180px] md:max-w-[200px]">{selectedFile.name}</span>
                    <button onClick={removeFile} className="ml-1 text-gray-600 dark:text-white/70 hover:text-red-400 rounded-full p-0.5" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>
                </div>
            </div>
        )}

        {/* Прихований інпут для файлів і фото */}
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx" capture="environment" />

        {/* ПРИХОВАНИЙ INPUT ДЛЯ АУДІО */}
        <input 
            type="file" 
            ref={audioInputRef} 
            onChange={handleAudioSelect} 
            className="hidden" 
            accept="audio/*" // Тільки аудіо-формати
        />

        {/* Блокуємо звичайний інпут, якщо є активне уточнення */}
        {currentClarification ? (
          <div className="max-w-4xl mx-auto p-4 text-center text-gray-600 dark:text-white/70">
            {currentClarification.options ? t('chat.select_option') : t('chat.type_answer')}
          </div>
        ) : (
          /* Основний рядок footer */
          <div className="max-w-4xl mx-auto relative flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 pb-1 sm:pb-1.5 pt-1 sm:pt-1.5"> 
              
              {/* 1. КНОПКА ПЛЮС (+) - об'єднує Скріпку та Камеру */}
              <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 sm:p-3 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition shrink-0" 
                  title="Додати файл/фото"
                  type="button"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-7 sm:h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
              </button>

              {/* Контейнер Інпуту та Кнопок Праворуч */}
              <div className="flex flex-1 items-center bg-gray-200/80 dark:bg-white/10 backdrop-blur-sm rounded-full py-1 sm:py-1.5 pr-1 sm:pr-1.5 pl-2 sm:pl-4">
                  
                  {/* Інпут */}
                  <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={t('chat.placeholder')}
                      className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/70 focus:outline-none focus:ring-0 py-1 sm:py-1.5 transition text-xs sm:text-sm md:text-base min-w-0"
                  />

                  {/* 2. КНОПКА МІКРОФОНА (Тепер працює!) */}
                  <button 
                      onClick={() => audioInputRef.current?.click()} // ПРИВ'ЯЗКА ДО НОВОГО INPUT
                      className="p-1.5 text-gray-600 dark:text-white/70 hover:bg-gray-300 dark:hover:bg-white/20 rounded-full transition shrink-0"
                      title="Голосовий ввід (MVP-заглушка)" 
                      type="button"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                  </button>
              </div>

              {/* 3. КНОПКА ВІДПРАВКИ */}
              <button 
                  onClick={handleSend}
                  disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                  className={`p-2 sm:p-3 rounded-full transition shrink-0 ${(!inputValue.trim() && !selectedFile) || isLoading ? 'bg-gray-300 dark:bg-white/20 text-gray-600 dark:text-white/70 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}
                  type="button"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
              </button>
          </div>
        )}
      </footer>
    </div>
  );
};

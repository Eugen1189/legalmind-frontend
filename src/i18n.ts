import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation dictionaries
const resources = {
  en: {
    translation: {
      login: {
        title: "LegalMind",
        subtitle_login: "Sign in to your account",
        subtitle_register: "Create a new account",
        email: "Email address",
        password: "Password",
        language: "Language",
        submit_login: "Sign in",
        submit_register: "Sign up",
        have_account: "Already have an account?",
        no_account: "Don't have an account?",
        toggle_login: "Sign in",
        toggle_register: "Create one",
        forgot_password: "Forgot password?",
        recovery_title: "Password recovery",
        recovery_instruction: "Enter the email address where we'll send the recovery link.",
        send_recovery: "Send recovery link",
        back_to_login: "Back to login",
      },
      chat: {
        welcome: "Welcome, {{email}}! I am LegalMind AI. How can I help you today?",
        placeholder: "Type your question...",
        send: "Send",
        install: "Install App",
        error_connect: "⚠️ Connection error: LegalMind server is offline (MVP Mode).",
        bot_response_mock: "This is a test response from LegalMind (MVP). The backend is not connected yet, but the interface works perfectly."
      },
      chips: {
        greeting: "Welcome, {{email}}!",
        start_prompt: "Where do we start?",
        patronato_query: "Patronato inquiry",
        check_deadlines: "Check deadlines (Scadenze)",
        find_documents: "Find necessary documents",
        simulate_case: "Simulate a legal case",
        patronato_prompt: "I have a question about the NASpI procedure.",
        deadlines_prompt: "What are the deadlines for submitting documents for pensione di vecchiaia?",
        documents_prompt: "What documents are needed for ricongiungimento?",
        simulate_prompt: "What are my rights in case of a work injury (INAIL)?"
      }
    }
  },
  uk: {
    translation: {
      login: {
        title: "LegalMind",
        subtitle_login: "Вхід у систему",
        subtitle_register: "Створення нового акаунту",
        email: "Електронна пошта",
        password: "Пароль",
        language: "Ваша мова",
        submit_login: "Увійти",
        submit_register: "Зареєструватися",
        have_account: "Вже маєте акаунт?",
        no_account: "Немає акаунту?",
        toggle_login: "Увійти",
        toggle_register: "Створити",
        forgot_password: "Забули пароль?",
        recovery_title: "Відновлення паролю",
        recovery_instruction: "Введіть email, на який ми надішлемо посилання для відновлення.",
        send_recovery: "Надіслати посилання",
        back_to_login: "Повернутися до входу",
      },
      chat: {
        welcome: "Вітаємо, {{email}}! Я LegalMind AI. Чим можу допомогти вам сьогодні?",
        placeholder: "Напишіть ваше запитання...",
        send: "Надіслати",
        install: "Встановити",
        error_connect: "⚠️ Помилка з'єднання: Сервер LegalMind поки не запущено (MVP режим).",
        bot_response_mock: "Це тестова відповідь від LegalMind (MVP). Бекенд ще не підключено, але інтерфейс працює коректно."
      },
      chips: {
        greeting: "Вітаємо, {{email}}!",
        start_prompt: "Із чого почати?",
        patronato_query: "Запит щодо Patronato",
        check_deadlines: "Перевірити терміни (Scadenze)",
        find_documents: "Знайти необхідні документи",
        simulate_case: "Просимулювати юридичний кейс",
        patronato_prompt: "У мене є питання щодо процедури NASpI.",
        deadlines_prompt: "Які терміни подачі документів на pensione di vecchiaia?",
        documents_prompt: "Які документи потрібні для ricongiungimento?",
        simulate_prompt: "Які мої права при травмі на роботі (INAIL)?"
      }
    }
  },
  it: {
    translation: {
      login: {
        title: "LegalMind",
        subtitle_login: "Accedi al sistema",
        subtitle_register: "Crea un nuovo account",
        email: "Indirizzo email",
        password: "Password",
        language: "Lingua",
        submit_login: "Accedi",
        submit_register: "Registrati",
        have_account: "Hai già un account?",
        no_account: "Non hai un account?",
        toggle_login: "Accedi",
        toggle_register: "Creane uno",
        forgot_password: "Password dimenticata?",
        recovery_title: "Recupero password",
        recovery_instruction: "Inserisci l'email a cui invieremo il link di recupero.",
        send_recovery: "Invia link",
        back_to_login: "Torna al login",
      },
      chat: {
        welcome: "Benvenuto, {{email}}! Sono LegalMind AI. Come posso aiutarti oggi?",
        placeholder: "Scrivi la tua domanda...",
        send: "Invia",
        install: "Installa App",
        error_connect: "⚠️ Errore di connessione: Il server LegalMind è offline (Modalità MVP).",
        bot_response_mock: "Questa è una risposta di prova da LegalMind (MVP). Il backend non è ancora collegato."
      },
      chips: {
        greeting: "Benvenuto, {{email}}!",
        start_prompt: "Da dove cominciamo?",
        patronato_query: "Domanda sul Patronato",
        check_deadlines: "Verifica scadenze (Deadlines)",
        find_documents: "Trova documenti necessari",
        simulate_case: "Simula un caso legale",
        patronato_prompt: "Ho una domanda sulla procedura NASpI.",
        deadlines_prompt: "Quali sono le scadenze per la pensione di vecchiaia?",
        documents_prompt: "Quali documenti sono necessari per il ricongiungimento?",
        simulate_prompt: "Quali sono i miei diritti in caso di infortunio sul lavoro (INAIL)?"
      }
    }
  },
  ru: {
      translation: {
        login: {
            title: "LegalMind",
            subtitle_login: "Вход в систему",
            subtitle_register: "Создание аккаунта",
            email: "Email",
            password: "Пароль",
            language: "Язык",
            submit_login: "Войти",
            submit_register: "Зарегистрироваться",
            have_account: "Уже есть аккаунт?",
            no_account: "Нет аккаунта?",
            toggle_login: "Войти",
            toggle_register: "Создать",
            forgot_password: "Забыли пароль?",
            recovery_title: "Восстановление пароля",
            recovery_instruction: "Введите email, на который мы отправим ссылку для восстановления.",
            send_recovery: "Отправить ссылку",
            back_to_login: "Вернуться к входу",
        },
        chat: {
            welcome: "Приветствую, {{email}}! Я LegalMind AI. Чем могу помочь?",
            placeholder: "Напишите ваш вопрос...",
            send: "Отправить",
            install: "Установить",
            error_connect: "⚠️ Ошибка соединения: Сервер офлайн.",
            bot_response_mock: "Это тестовый ответ."
        },
        chips: {
            greeting: "Приветствую, {{email}}!",
            start_prompt: "С чего начать?",
            patronato_query: "Запрос по Patronato",
            check_deadlines: "Проверить сроки (Scadenze)",
            find_documents: "Найти необходимые документы",
            simulate_case: "Симулировать юридический кейс",
            patronato_prompt: "У меня есть вопрос о процедуре NASpI.",
            deadlines_prompt: "Какие сроки подачи документов на pensione di vecchiaia?",
            documents_prompt: "Какие документы нужны для ricongiungimento?",
            simulate_prompt: "Какие мои права при травме на работе (INAIL)?"
        }
      }
  },
  ro: {
    translation: {
      login: {
        title: "LegalMind",
        subtitle_login: "Autentificare în sistem",
        subtitle_register: "Creare cont nou",
        email: "Adresa de email",
        password: "Parolă",
        language: "Limba dvs.",
        submit_login: "Autentificare",
        submit_register: "Înregistrare",
        have_account: "Aveți deja un cont?",
        no_account: "Nu aveți cont?",
        toggle_login: "Autentificare",
        toggle_register: "Creați unul",
        forgot_password: "Ați uitat parola?",
        recovery_title: "Recuperare parolă",
        recovery_instruction: "Introduceți adresa de email la care vom trimite link-ul de recuperare.",
        send_recovery: "Trimiteți link-ul",
        back_to_login: "Înapoi la autentificare",
      },
      chat: {
        welcome: "Bun venit, {{email}}! Sunt LegalMind AI. Cum vă pot ajuta astăzi?",
        placeholder: "Scrieți întrebarea dvs....",
        send: "Trimiteți",
        install: "Instalați Aplicația",
        error_connect: "⚠️ Eroare de conexiune: Serverul LegalMind este deconectat (Modul MVP).",
        bot_response_mock: "Aceasta este un răspuns de test de la LegalMind (MVP)."
      },
      chips: {
        greeting: "Bun venit, {{email}}!",
        start_prompt: "Cu ce să începem?",
        patronato_query: "Întrebări despre Patronato",
        check_deadlines: "Verificați termenele (Scadenze)",
        find_documents: "Găsiți documente necesare",
        simulate_case: "Simulați un caz legal",
        patronato_prompt: "Am o întrebare despre procedura NASpI.",
        deadlines_prompt: "Care sunt termenele pentru pensia de bătrânețe?",
        documents_prompt: "Ce documente sunt necesare pentru ricongiungimento?",
        simulate_prompt: "Care sunt drepturile mele în caz de accident de muncă (INAIL)?"
      }
    }
  },
  ar: {
    translation: {
      login: {
        title: "LegalMind",
        subtitle_login: "تسجيل الدخول إلى الحساب",
        subtitle_register: "إنشاء حساب جديد",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        language: "لغتك",
        submit_login: "تسجيل الدخول",
        submit_register: "تسجيل",
        have_account: "هل لديك حساب بالفعل؟",
        no_account: "ليس لديك حساب؟",
        toggle_login: "تسجيل الدخول",
        toggle_register: "إنشاء واحد",
        forgot_password: "نسيت كلمة المرور؟",
        recovery_title: "استعادة كلمة المرور",
        recovery_instruction: "أدخل البريد الإلكتروني الذي سنرسل إليه رابط الاستعادة.",
        send_recovery: "إرسال رابط الاستعادة",
        back_to_login: "العودة لتسجيل الدخول",
      },
      chat: {
        welcome: "مرحباً، {{email}}! أنا LegalMind AI. كيف يمكنني مساعدتك اليوم؟",
        placeholder: "اكتب سؤالك...",
        send: "إرسال",
        install: "تثبيت التطبيق",
        error_connect: "⚠️ خطأ في الاتصال: خادم LegalMind غير متصل (وضع MVP).",
        bot_response_mock: "هذه استجابة اختبار من LegalMind (MVP)."
      },
      chips: {
        greeting: "مرحباً، {{email}}!",
        start_prompt: "من أين نبدأ؟",
        patronato_query: "استفسار حول Patronato",
        check_deadlines: "التحقق من المواعيد النهائية",
        find_documents: "البحث عن المستندات المطلوبة",
        simulate_case: "محاكاة قضية قانونية",
        patronato_prompt: "لدي سؤال حول إجراء NASpI.",
        deadlines_prompt: "ما هي المواعيد النهائية لتقديم طلب التقاعد؟",
        documents_prompt: "ما هي المستندات المطلوبة لـ ricongiungimento؟",
        simulate_prompt: "ما هي حقوقي في حالة وقوع حادث عمل (INAIL)؟"
      }
    }
  }
};

i18n
  .use(LanguageDetector) // Automatically detects browser language
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it', // ITALIAN - default main language
    interpolation: {
      escapeValue: false,
    },
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
    }
  });

export default i18n;


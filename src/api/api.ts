import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; 

const SESSION_STORAGE_KEY = 'legalmind_session_id';

// Клас для управління Session ID та його генерації
class SessionManager {
    private sessionId: string | null = null;

    constructor() {
        this.loadSessionId();
    }

    private loadSessionId(): void {
        const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedId) {
            this.sessionId = storedId;
        } else {
            // Генерація унікального ID при першому запиті 
            this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(SESSION_STORAGE_KEY, this.sessionId);
        }
    }

    public getSessionId(): string {
        return this.sessionId || '';
    }
}

export const sessionManager = new SessionManager();

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
});

// НОВЕ: Перехоплювач для обробки помилок (в першу чергу 401)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Якщо токен недійсний, викидаємо спеціальну помилку
            throw new Error('Unauthorized'); 
        }
        return Promise.reject(error);
    }
);

// Інтерфейси
export interface ChatRequest {
  text: string;
  user_language: string;
  session_id: string; // Тепер обов'язковий!
  file_data?: string;
  file_name?: string;
}

// Інтерфейс для уточнюючих питань
export interface Clarification {
  question: string;
  options?: string[];
}

// --- НОВІ ІНТЕРФЕЙСИ ---
export interface ActionItem {
  type: "form" | "link" | "instruction" | "document"; // [cite: 78]
  title: string;
  description?: string;
  url?: string; // [cite: 78]
  form_id?: string; // [cite: 79]
  steps?: string[]; // [cite: 80]
}

export interface Consultant {
  id: string; // [cite: 75]
  name: string;
  specialization: string;
  location?: string;
  rating?: number; // [cite: 76]
  languages: string[];
  contact_info?: { // [cite: 77]
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface ConsultantDecision {
  needs_consultant: boolean; // [cite: 73]
  requires_consultant: boolean;
  can_solve_alone: boolean;
  reason: string;
  confidence: number; // [cite: 74]
}

// ОНОВЛЕННЯ: Payload тепер містить повні дані Patronato
export interface PatronatoResponsePayload {
    response_native: string;
    response_it: string; // [cite: 66]
    source: "rag" | "web" | "hybrid"; // [cite: 67]
    confidence: number;
    decision: ConsultantDecision; // [cite: 68]
    consultants: Consultant[]; // [cite: 68]
    action_items: ActionItem[]; // [cite: 69]
    // ... інші поля
}

export interface ChatResponse {
  original_text: string;
  steps: {
    is_ambiguous?: boolean;
    clarification?: Clarification;
  };
  result?: {
    status: "ok" | "error";
    payload: PatronatoResponsePayload;
  };
}

// Інтерфейс для відповіді аудіо-запиту (з Transcription)
export interface AudioResponse {
  transcription: {
    original_text: string; // Транскрибований текст 
    detected_language: string;
    audio_filename: string;
  };
  // Усі інші поля, як у ChatResponse, але в спрощеному вигляді для MVP
  result?: {
    payload: {
      response_native: string;
    };
  };
  // ...
}

// Function to convert file to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Оновлена функція відправки
export const sendMessageToBackend = async (
  text: string, 
  language: string,
  file?: File,
  // Додаємо опціональний токен
  token?: string 
): Promise<ChatResponse> => { // ТЕПЕР ПОВЕРТАЄМО ПОВНИЙ ОБ'ЄКТ
  try {
    let fileData = undefined;
    let fileName = undefined;
    
    if (file) {
      fileData = await fileToBase64(file);
      fileName = file.name;
    }

    // 1. Формування заголовків з токеном
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
        // Формат заголовка: Authorization: Bearer <token>
        headers['Authorization'] = `Bearer ${token}`; 
    }

    const requestBody: any = {
        text: text,
        user_language: language,
        session_id: sessionManager.getSessionId(),
        file_data: fileData,
        file_name: fileName,
    };
    
    const response = await client.post<ChatResponse>('/external/process', requestBody, { headers });
    return response.data;

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
        throw error; // Пропускаємо далі для обробки в Chat.tsx
    }
    // Обробка мережевих та загальних помилок
    throw new Error(error instanceof Error ? error.message : "Сервіс недоступний.");
  }
};

// Функція для відправки аудіо
export const processAudio = async (
  audioFile: File,
  language: string,
  token?: string 
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile); // Аудіо файл 
    formData.append('user_language', language);
    formData.append('session_id', sessionManager.getSessionId());
    
    // 1. Формування заголовків з токеном
    const headers: Record<string, string> = {};
    // Content-Type буде автоматично встановлений як multipart/form-data
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
    }

    // 2. Відправка POST /external/process-audio
    const response = await client.post<AudioResponse>('/external/process-audio', formData, { headers });

    // Згідно з ТЗ, ми очікуємо, що бекенд поверне повну відповідь, включаючи транскрибований текст і результат.
    // Для UI ми повернемо транскрибований текст, який буде відправлено в executeSend
    return response.data.transcription.original_text; 

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
        throw error; // Пропускаємо далі для обробки в Chat.tsx
    }
    // Обробка мережевих та загальних помилок
    throw new Error(error instanceof Error ? error.message : "Сервіс аудіо-обробки недоступний.");
  }
};

// НОВА ФУНКЦІЯ: Перевірка здоров'я бекенду
export const checkHealth = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        // Очікуємо 200 OK згідно з ТЗ 
        return response.status === 200 && response.data.status === "LegalMind backend running";
    } catch (error) {
        return false; // Помилка мережі або 5xx
    }
};

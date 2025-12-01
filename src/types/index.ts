// src/types/index.ts

// Note the export keyword before each type/interface

export type UserLanguage = 'ru' | 'en' | 'it' | 'uk';

export interface User {
  email: string;
  language: UserLanguage;
  token?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  isLoading?: boolean;
  sources?: string[];
}

export interface BackendResponse {
  pipeline: {
    intent: string;
    domain: string;
  };
  internal_response: {
    status: string;
    payload: {
      details: string;
      rag_results?: string[];
    };
  };
}

// src/lib/constants/validation.ts
export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
  };
  
  export const EMAIL_PATTERNS = {
    // Блокируем общедоступные почтовые сервисы для регистрации
    BLOCKED_DOMAINS: [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'mail.ru',
      'yandex.ru'
    ],
    // Регулярное выражение для проверки рабочей почты
    WORK_EMAIL: /^[A-Z0-9._%+-]+@(?!gmail\.com)(?!yahoo\.com)(?!hotmail\.com)(?!.*\.co\.uk$)[A-Z0-9.-]+\.[A-Z]{2,}$/i
  };